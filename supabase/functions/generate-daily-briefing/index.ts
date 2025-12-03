import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch comprehensive financial data in parallel
    const [
      { data: todayTransactions },
      { data: budgets },
      { data: goals },
      { data: upcomingBills },
      { data: accounts },
      { data: investments },
      { data: recentTransactions },
      { data: debts }
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount, transaction_type, merchant, description')
        .eq('user_id', user.id)
        .gte('transaction_date', todayStart.toISOString())
        .lte('transaction_date', todayEnd.toISOString()),
      supabase
        .from('user_budgets')
        .select('*, budget_spending(*)')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('target_amount', { ascending: false }),
      supabase
        .from('detected_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'paused')
        .gte('next_expected_date', new Date().toISOString())
        .lte('next_expected_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('next_expected_date', { ascending: true })
        .limit(5),
      supabase
        .from('connected_accounts')
        .select('balance, institution_name')
        .eq('user_id', user.id),
      supabase
        .from('investment_accounts')
        .select('*, holdings:investment_holdings(*)')
        .eq('user_id', user.id)
        .limit(10),
      supabase
        .from('transactions')
        .select('amount, transaction_type, merchant, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('transaction_date', { ascending: false })
        .limit(50),
      supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);

    // Calculate rich financial metrics
    const todaySpending = todayTransactions?.reduce((sum, t) => 
      t.transaction_type === 'debit' ? sum + Number(t.amount) : sum, 0) || 0;
    
    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
    
    const budgetUtilization = (budgets && budgets.length > 0)
      ? (budgets[0].budget_spending?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0) / Number(budgets[0].budget_amount)
      : 0;

    // Calculate 7-day spending trend
    const weeklySpending = recentTransactions
      ?.filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const avgDailySpending = weeklySpending / 7;

    // Find near-complete goals (>85%)
    const nearCompleteGoals = goals?.filter(g => {
      const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
      return progress >= 85 && progress < 100;
    }).sort((a, b) => {
      const progressA = (Number(a.current_amount) / Number(a.target_amount)) * 100;
      const progressB = (Number(b.current_amount) / Number(b.target_amount)) * 100;
      return progressB - progressA;
    }) || [];

    const topGoal = nearCompleteGoals[0];
    const goalProgress = topGoal 
      ? (Number(topGoal.current_amount) / Number(topGoal.target_amount)) * 100
      : 0;

    // Calculate investment performance
    const totalInvestmentValue = investments?.reduce((sum, inv) => 
      sum + Number(inv.total_value || 0), 0) || 0;
    const totalCostBasis = investments?.reduce((sum, inv) => 
      sum + Number(inv.cost_basis || 0), 0) || 0;
    const portfolioGainLoss = totalInvestmentValue - totalCostBasis;
    const portfolioReturnPercent = totalCostBasis > 0 
      ? (portfolioGainLoss / totalCostBasis) * 100 
      : 0;

    // Extract top holdings/tickers
    const allHoldings = investments?.flatMap(inv => inv.holdings || []) || [];
    const topHoldings = allHoldings
      .sort((a, b) => Number(b.total_value || 0) - Number(a.total_value || 0))
      .slice(0, 3)
      .map(h => ({
        ticker: h.ticker_symbol,
        value: Number(h.total_value || 0),
        gain: h.total_value && h.cost_basis 
          ? ((Number(h.total_value) - Number(h.cost_basis)) / Number(h.cost_basis)) * 100 
          : 0
      }));

    // Identify urgent bills (due within 48 hours)
    const urgentBills = upcomingBills?.filter(bill => {
      const daysUntilDue = (new Date(bill.next_expected_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilDue <= 2;
    }) || [];

    // Calculate debt-to-income ratio (if applicable)
    const totalDebt = debts?.reduce((sum, d) => sum + Number(d.current_balance || 0), 0) || 0;

    // Use Lovable AI for generation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are $ave+, a sophisticated AI financial analyst. 
Generate a hyper-personalized 2-3 sentence daily briefing that:

1. **First sentence**: Highlight the MOST SIGNIFICANT financial event or trend today. Use specific numbers, tickers, and percentage changes.
   - If portfolio moved significantly, mention top gainers/losers by ticker
   - If spending is unusual (high/low vs. average), call it out
   - If a goal milestone was reached, celebrate it

2. **Second sentence**: Provide ACTIONABLE CONTEXT or warnings
   - Urgent bills due within 48 hours
   - Budget categories at risk (>90% spent)
   - Opportunities (excess cash, goal nearly complete)

3. **Optional third sentence**: Long-term insight if highly relevant
   - Progress toward major goals (>85% complete)
   - Portfolio rebalancing suggestions
   - Debt reduction wins

Tone: Data-driven, conversational, motivational. Always use specific numbers (e.g., "$427" not "a lot"). Mention tickers when relevant (e.g., "NVDA +8.2%"). Be concise but impactful.

CRITICAL: Do NOT use generic phrases like "great progress" or "keep it up". Use SPECIFIC data points.`;

    const userPrompt = `Analyze this complete financial snapshot and generate a daily briefing:

**TODAY'S ACTIVITY:**
- Spending today: $${todaySpending.toFixed(2)}
- Average daily spending (7-day): $${avgDailySpending.toFixed(2)}
- Comparison: ${todaySpending > avgDailySpending * 1.5 ? 'HIGH (above average)' : todaySpending < avgDailySpending * 0.5 ? 'LOW (below average)' : 'NORMAL'}

**NET WORTH:**
- Total balance: $${totalBalance.toFixed(2)}
- Total debt: $${totalDebt.toFixed(2)}
- Net worth: $${(totalBalance - totalDebt).toFixed(2)}

**INVESTMENT PORTFOLIO:**
- Total value: $${totalInvestmentValue.toFixed(2)}
- Cost basis: $${totalCostBasis.toFixed(2)}
- Gain/Loss: $${portfolioGainLoss.toFixed(2)} (${portfolioReturnPercent >= 0 ? '+' : ''}${portfolioReturnPercent.toFixed(2)}%)
- Top holdings: ${topHoldings.length > 0 
  ? topHoldings.map(h => `${h.ticker} (${h.gain >= 0 ? '+' : ''}${h.gain.toFixed(1)}%)`).join(', ')
  : 'No holdings'}

**BUDGETS:**
- Overall utilization: ${(budgetUtilization * 100).toFixed(0)}%
- Status: ${budgetUtilization > 0.9 ? 'OVERSPENT (>90%)' : budgetUtilization > 0.7 ? 'HIGH (70-90%)' : 'HEALTHY'}

**GOALS:**
- Near-complete goals (>85%): ${nearCompleteGoals.length}
${topGoal ? `- Top goal: "${topGoal.name}" at ${goalProgress.toFixed(0)}% ($${topGoal.current_amount}/$${topGoal.target_amount}, $${(Number(topGoal.target_amount) - Number(topGoal.current_amount)).toFixed(0)} remaining)` : ''}

**BILLS:**
- Urgent bills (due ≤48h): ${urgentBills.length}
${urgentBills.length > 0 ? `- URGENT: ${urgentBills.map(b => `"${b.merchant}" ($${b.average_charge}) due ${new Date(b.next_expected_date).toLocaleDateString()}`).join(', ')}` : ''}
- All upcoming bills (next 7 days): ${upcomingBills?.length || 0}

Generate the briefing NOW:`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        message,
        metrics: {
          todaySpending,
          totalBalance,
          budgetUtilization,
          goalProgress,
          upcomingBillsCount: upcomingBills?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-daily-briefing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
