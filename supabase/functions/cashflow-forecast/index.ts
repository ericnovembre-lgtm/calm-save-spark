import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { days = 30 } = await req.json().catch(() => ({}));

    // Fetch transactions from the last 90 days for pattern analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', ninetyDaysAgo.toISOString())
      .order('transaction_date', { ascending: true });

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          forecast: [],
          message: 'Not enough transaction history for forecasting'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate daily averages
    const dailyTotals: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const date = new Date(tx.transaction_date).toISOString().split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(String(tx.amount));
    });

    const avgDailySpending = Object.values(dailyTotals).reduce((a, b) => a + b, 0) / Object.keys(dailyTotals).length;

    // Identify recurring transactions
    const recurringIncome = transactions.filter(tx => 
      parseFloat(String(tx.amount)) < 0 && tx.is_recurring
    );
    const avgMonthlyIncome = recurringIncome.length > 0
      ? recurringIncome.reduce((sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))), 0) / 3
      : 0;

    // Generate forecast
    const forecast = [];
    let runningBalance = 0;

    const { data: accounts } = await supabaseClient
      .from('connected_accounts')
      .select('balance')
      .eq('user_id', user.id);
    
    runningBalance = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0;

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Add expected income (monthly income divided by 30)
      const dailyIncome = avgMonthlyIncome / 30;
      
      // Subtract expected spending
      const dailySpending = avgDailySpending > 0 ? avgDailySpending : avgDailySpending * -1;
      
      runningBalance += dailyIncome - dailySpending;

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        projected_balance: Math.max(0, runningBalance),
        income: dailyIncome,
        spending: dailySpending,
        net: dailyIncome - dailySpending
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        forecast,
        summary: {
          avg_daily_spending: avgDailySpending,
          avg_monthly_income: avgMonthlyIncome,
          current_balance: accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0,
          projected_end_balance: forecast[forecast.length - 1].projected_balance
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cashflow Forecast Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
