import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    // Check for recent analysis (cache for 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAnalysis } = await supabase
      .from('liquidity_health_analyses')
      .select('*')
      .eq('user_id', user.id)
      .gte('analyzed_at', oneHourAgo)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    if (recentAnalysis) {
      return new Response(
        JSON.stringify(recentAnalysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch comprehensive financial data
    const [
      { data: accounts },
      { data: debts },
      { data: goals },
      { data: budgets },
      { data: transactions },
      { data: liquidityData }
    ] = await Promise.all([
      supabase.from('connected_accounts').select('*').eq('user_id', user.id),
      supabase.from('user_debts').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('user_budgets').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.functions.invoke('calculate-liquidity')
    ]);

    const totalCash = accounts?.reduce((sum, a) => sum + (a.current_balance || a.balance || 0), 0) || 0;
    const totalDebt = debts?.reduce((sum, d) => sum + (d.current_balance || 0), 0) || 0;
    const monthlyDebtPayments = debts?.reduce((sum, d) => sum + (d.minimum_payment || 0), 0) || 0;
    const cashToDebtRatio = totalDebt > 0 ? (totalCash / totalDebt) : 999;

    const safeToSpend = liquidityData?.data?.safeToSpend || 0;
    const runway = liquidityData?.data?.runway || 0;
    const upcomingBills = liquidityData?.data?.upcomingBills || 0;

    // Calculate savings rate (last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions?.filter(t => new Date(t.date) > threeMonthsAgo) || [];
    const totalSpent = recentTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = Math.abs(recentTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    // Calculate emergency fund coverage
    const monthlyExpenses = totalSpent / 3;
    const emergencyFundMonths = monthlyExpenses > 0 ? totalCash / monthlyExpenses : 0;

    // Account diversification
    const accountTypes = new Set(accounts?.map(a => a.account_type) || []);
    const diversificationScore = Math.min(accountTypes.size * 25, 100);

    const prompt = `Perform a comprehensive financial health analysis for a $ave+ user.

LIQUIDITY METRICS:
• Total Cash: $${totalCash.toFixed(2)}
• Safe to Spend: $${safeToSpend.toFixed(2)}
• Runway: ${runway} days
• Upcoming Bills: $${upcomingBills.toFixed(2)}
• Emergency Fund Coverage: ${emergencyFundMonths.toFixed(1)} months

DEBT METRICS:
• Total Debt: $${totalDebt.toFixed(2)}
• Monthly Debt Payments: $${monthlyDebtPayments.toFixed(2)}
• Cash-to-Debt Ratio: ${cashToDebtRatio.toFixed(2)}:1

INCOME & SPENDING (last 3 months):
• Total Income: $${totalIncome.toFixed(2)}
• Total Spending: $${totalSpent.toFixed(2)}
• Savings Rate: ${savingsRate.toFixed(1)}%
• Monthly Expenses: $${monthlyExpenses.toFixed(2)}

ACCOUNT STRUCTURE:
${accounts?.map(a => `- ${a.account_type}: $${(a.current_balance || a.balance || 0).toFixed(2)} @ ${a.apy || 0}% APY`).join('\n') || 'No accounts'}
• Diversification Score: ${diversificationScore}/100

GOALS & BUDGETS:
• Active Goals: ${goals?.length || 0}
• Active Budgets: ${budgets?.length || 0}

Provide a comprehensive health analysis with:
1. Overall Health Score (0-100): Based on runway > 30 days (+20), emergency fund > 3 months (+20), debt-to-cash ratio < 0.5 (+20), savings rate > 10% (+20), diversification (+20)
2. Score Label: "Excellent" (90-100), "Good" (75-89), "Fair" (60-74), "Needs Attention" (40-59), "Critical" (0-39)
3. Key Strengths: 2-3 specific bullet points highlighting positive aspects
4. Critical Risks: 2-3 bullet points with severity (low/medium/high) for areas of concern
5. Top 3 Actionable Recommendations: Specific, measurable actions with expected impact
6. One-sentence summary: Concise overall assessment

Format as JSON:
{
  "healthScore": number,
  "scoreLabel": string,
  "strengths": string[],
  "risks": [{ "description": string, "severity": "low" | "medium" | "high" }],
  "recommendations": [{ "title": string, "description": string, "impact": string }],
  "summary": string
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or extra text.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: 'You are a financial health analyst. Return only valid JSON without markdown.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const aiData = await aiResponse.json();
    let analysisResult = aiData.choices[0].message.content;

    // Clean up JSON response
    analysisResult = analysisResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(analysisResult);

    // Store analysis
    const { data: storedAnalysis } = await supabase
      .from('liquidity_health_analyses')
      .insert({
        user_id: user.id,
        health_score: analysis.healthScore,
        score_label: analysis.scoreLabel,
        strengths: analysis.strengths,
        risks: analysis.risks,
        recommendations: analysis.recommendations,
        summary: analysis.summary,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify(storedAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-liquidity-health function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
