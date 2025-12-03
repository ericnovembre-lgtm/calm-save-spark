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

    const { message, sessionId } = await req.json();

    // Fetch comprehensive financial snapshot
    const [
      { data: accounts },
      { data: debts },
      { data: goals },
      { data: transactions },
      { data: liquidityData }
    ] = await Promise.all([
      supabase.from('connected_accounts').select('*').eq('user_id', user.id),
      supabase.from('user_debts').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
      supabase.functions.invoke('calculate-liquidity')
    ]);

    const totalCash = accounts?.reduce((sum, a) => sum + (a.current_balance || a.balance || 0), 0) || 0;
    const totalDebt = debts?.reduce((sum, d) => sum + (d.current_balance || 0), 0) || 0;
    const monthlyDebtPayments = debts?.reduce((sum, d) => sum + (d.minimum_payment || 0), 0) || 0;
    const cashToDebtRatio = totalDebt > 0 ? (totalCash / totalDebt).toFixed(2) : 'N/A';

    const safeToSpend = liquidityData?.data?.safeToSpend || 0;
    const runway = liquidityData?.data?.runway || 0;
    const upcomingBills = liquidityData?.data?.upcomingBills || 0;
    const dailySpendAvg = liquidityData?.data?.dailySpendAvg || 0;

    // Estimate monthly income from recent deposits
    const recentDeposits = transactions?.filter(t => t.amount < 0) || [];
    const monthlyIncome = recentDeposits.length > 0 
      ? Math.abs(recentDeposits.reduce((sum, t) => sum + t.amount, 0) / recentDeposits.length) * 30 
      : 0;

    // Build context for AI
    const context = `You are the AI CFO for $ave+, a financial advisor specializing in liquidity management and cash flow optimization.

USER'S CURRENT FINANCIAL SNAPSHOT:
• Safe to Spend: $${safeToSpend.toFixed(2)} (Cash minus upcoming bills)
• Total Cash: $${totalCash.toFixed(2)} (across ${accounts?.length || 0} liquid accounts)
• Upcoming Bills: $${upcomingBills.toFixed(2)} (next 30 days)
• Runway: ${runway} days at current spending pace
• Daily Average Spend: $${dailySpendAvg.toFixed(2)}
• Total Debt: $${totalDebt.toFixed(2)}
• Monthly Debt Payments: $${monthlyDebtPayments.toFixed(2)}
• Cash-to-Debt Ratio: ${cashToDebtRatio}:1
• Estimated Monthly Income: $${monthlyIncome.toFixed(2)}

CONNECTED ACCOUNTS:
${accounts?.map(a => `- ${a.institution_name} ${a.account_type}: $${(a.current_balance || a.balance || 0).toFixed(2)} @ ${a.apy || 0}% APY`).join('\n') || 'No accounts connected'}

ACTIVE DEBTS:
${debts?.map(d => `- ${d.debt_type}: $${(d.current_balance || 0).toFixed(2)} (${d.interest_rate}% APR, min payment: $${d.minimum_payment})`).join('\n') || 'No active debts'}

SAVINGS GOALS:
${goals?.map(g => `- ${g.name}: $${g.current_amount}/$${g.target_amount} (${((g.current_amount/g.target_amount)*100).toFixed(0)}%)`).join('\n') || 'No active goals'}

RECENT SPENDING (last 20 transactions):
${transactions?.filter(t => t.amount > 0).slice(0, 10).map(t => `- ${t.merchant || 'Unknown'}: $${t.amount.toFixed(2)}`).join('\n') || 'No recent transactions'}

When the user asks about affordability:
1. If expense > Safe to Spend: "No, this would exceed your safe-to-spend buffer by $X"
2. If expense < Safe to Spend but > 50% of it: "Possible, but it would reduce your runway to Y days (currently ${runway} days)"
3. If expense < 30% of Safe to Spend: "Yes, you can comfortably afford this while maintaining ${runway - Math.floor((0.3 * safeToSpend) / dailySpendAvg)} days of runway"

Always provide specific numbers and reasoning. Be concise but mathematically precise. Respond in 2-4 sentences.`;

    // Get or create session
    let session;
    if (sessionId) {
      const { data } = await supabase
        .from('ai_cfo_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession } = await supabase
        .from('ai_cfo_sessions')
        .insert({ user_id: user.id, conversation_history: [] })
        .select()
        .single();
      session = newSession;
    }

    const conversationHistory = session?.conversation_history || [];
    const messages = [
      { role: 'system', content: context },
      ...conversationHistory.slice(-10), // Keep last 10 messages
      { role: 'user', content: message }
    ];

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages,
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
    const assistantMessage = aiData.choices[0].message.content;

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage }
    ];

    await supabase
      .from('ai_cfo_sessions')
      .update({
        conversation_history: updatedHistory,
        message_count: updatedHistory.length / 2,
        last_message_at: new Date().toISOString()
      })
      .eq('id', session.id);

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        sessionId: session.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-cfo function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
