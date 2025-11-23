import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[calculate-liquidity-forecast] Generating forecast for user:', user.id);

    // Fetch historical transactions (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, transaction_date, category')
      .eq('user_id', user.id)
      .gte('transaction_date', ninetyDaysAgo.toISOString())
      .lt('amount', 0) // Only expenses
      .order('transaction_date', { ascending: true });

    // Fetch recurring bills
    const { data: bills } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Fetch current liquidity using existing function
    const { data: currentLiquidity, error: liquidityError } = await supabase.functions.invoke(
      'calculate-liquidity',
      {
        headers: { Authorization: authHeader },
      }
    );

    if (liquidityError) {
      console.error('[calculate-liquidity-forecast] Liquidity error:', liquidityError);
      throw liquidityError;
    }

    console.log('[calculate-liquidity-forecast] Current liquidity:', currentLiquidity);

    // Calculate spending patterns by day of week
    const spendingByDay: Record<number, number[]> = {};
    transactions?.forEach(tx => {
      const date = new Date(tx.transaction_date);
      const dayOfWeek = date.getDay();
      if (!spendingByDay[dayOfWeek]) spendingByDay[dayOfWeek] = [];
      spendingByDay[dayOfWeek].push(Math.abs(tx.amount));
    });

    // Calculate average spending per day of week
    const avgSpendingByDay: Record<number, number> = {};
    for (const day in spendingByDay) {
      const amounts = spendingByDay[day];
      avgSpendingByDay[day] = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    }

    // Estimate monthly income from recurring income transactions
    const { data: incomeTransactions } = await supabase
      .from('recurring_transactions')
      .select('amount, frequency')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('transaction_type', 'income');

    let monthlyIncome = 0;
    incomeTransactions?.forEach(income => {
      if (income.frequency === 'monthly') {
        monthlyIncome += income.amount;
      } else if (income.frequency === 'biweekly') {
        monthlyIncome += (income.amount * 26) / 12;
      } else if (income.frequency === 'weekly') {
        monthlyIncome += (income.amount * 52) / 12;
      }
    });

    console.log('[calculate-liquidity-forecast] Monthly income estimate:', monthlyIncome);

    // Generate 90-day forecast
    const forecast = [];
    let currentSafeToSpend = currentLiquidity.safeToSpend || 0;
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Get expected spending for this day
      const expectedSpending = avgSpendingByDay[dayOfWeek] || currentLiquidity.dailySpendAvg || 0;
      
      // Check for bills on this date
      let billAmount = 0;
      bills?.forEach(bill => {
        const nextDueDate = new Date(bill.next_due_date);
        if (
          nextDueDate.getFullYear() === date.getFullYear() &&
          nextDueDate.getMonth() === date.getMonth() &&
          nextDueDate.getDate() === date.getDate()
        ) {
          billAmount += Math.abs(bill.amount);
        }
      });
      
      // Add income on the 1st and 15th (simplified payday logic)
      const isPayday = date.getDate() === 1 || date.getDate() === 15;
      const incomeForDay = isPayday ? (monthlyIncome / 2) : 0;
      
      // Calculate new safe to spend
      currentSafeToSpend = currentSafeToSpend - expectedSpending - billAmount + incomeForDay;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        safeToSpend: Math.max(0, Math.round(currentSafeToSpend * 100) / 100),
        expectedSpending: Math.round(expectedSpending * 100) / 100,
        bills: Math.round(billAmount * 100) / 100,
        income: Math.round(incomeForDay * 100) / 100,
      });
    }

    console.log('[calculate-liquidity-forecast] Generated forecast points:', forecast.length);

    return new Response(
      JSON.stringify({ forecast }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[calculate-liquidity-forecast] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
