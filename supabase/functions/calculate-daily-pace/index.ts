import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { budget_id, total_limit, spent_amount, period_start, period_end } = await req.json();

    // Calculate days remaining
    const now = new Date();
    const periodEndDate = new Date(period_end);
    const daysRemaining = Math.max(1, Math.ceil((periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate remaining budget
    const remaining = Math.max(0, total_limit - spent_amount);
    
    // Calculate safe daily spend
    const safeDailySpend = remaining / daysRemaining;
    
    // Determine spending velocity (last 7 days)
    const { data: recentTransactions } = await supabaseClient
      .from('transactions')
      .select('amount, date')
      .eq('budget_id', budget_id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    const recentSpend = recentTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
    const avgDailySpend = recentSpend / 7;
    
    // Determine status
    let status = 'on_pace';
    let recommendation = '';
    
    if (avgDailySpend < safeDailySpend * 0.8) {
      status = 'under_pace';
      recommendation = `You're spending below your safe daily limit. Great job staying on track!`;
    } else if (avgDailySpend > safeDailySpend * 1.2) {
      status = 'over_pace';
      recommendation = `Your recent spending is above the safe daily pace. Consider adjusting your habits for the remaining ${daysRemaining} days.`;
    } else {
      recommendation = `You're on track! Maintain your current pace to stay within budget.`;
    }

    const result = {
      safe_daily_spend: safeDailySpend,
      days_remaining: daysRemaining,
      remaining_budget: remaining,
      recent_daily_average: avgDailySpend,
      status,
      recommendation
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calculating daily pace:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
