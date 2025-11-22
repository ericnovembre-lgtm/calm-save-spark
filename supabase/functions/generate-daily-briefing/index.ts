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

    // Fetch today's data in parallel
    const [
      { data: todayTransactions },
      { data: budgets },
      { data: goals },
      { data: upcomingBills },
      { data: accounts }
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount, transaction_type')
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
        .eq('is_active', true),
      supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('due_date', { ascending: true })
        .limit(3),
      supabase
        .from('connected_accounts')
        .select('balance')
        .eq('user_id', user.id)
    ]);

    // Calculate metrics
    const todaySpending = todayTransactions?.reduce((sum, t) => 
      t.transaction_type === 'debit' ? sum + Number(t.amount) : sum, 0) || 0;
    
    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
    
    const budgetUtilization = (budgets && budgets.length > 0)
      ? (budgets[0].budget_spending?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0) / Number(budgets[0].budget_amount)
      : 0;

    const nearestGoal = goals?.sort((a, b) => {
      const progressA = Number(a.current_amount) / Number(a.target_amount);
      const progressB = Number(b.current_amount) / Number(b.target_amount);
      return progressB - progressA;
    })[0];

    const goalProgress = nearestGoal 
      ? (Number(nearestGoal.current_amount) / Number(nearestGoal.target_amount)) * 100
      : 0;

    // Use Lovable AI for generation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are $ave+, a friendly AI financial assistant. 
Generate a 2-sentence daily briefing that:
1. First sentence: What happened financially today (spending, savings, transfers)
2. Second sentence: What's coming up or progress toward goals

Tone: Encouraging, conversational, specific with numbers. Use emojis sparingly but effectively.

Example: "You spent $42.50 today, staying well within your daily budget. You're on track to hit your $500 vacation goal by Friday! 🎉"`;

    const userPrompt = `Generate a daily briefing based on:
- Today's spending: $${todaySpending.toFixed(2)}
- Total balance: $${totalBalance.toFixed(2)}
- Budget utilization: ${(budgetUtilization * 100).toFixed(0)}%
- Nearest goal: ${nearestGoal?.name || 'None'} at ${goalProgress.toFixed(0)}% (${nearestGoal ? `$${nearestGoal.current_amount}/$${nearestGoal.target_amount}` : 'N/A'})
- Upcoming bills: ${upcomingBills?.length || 0} in next 7 days (${upcomingBills?.map(b => `$${b.amount}`).join(', ') || 'none'})`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 200
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
