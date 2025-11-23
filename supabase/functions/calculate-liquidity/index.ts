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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all connected accounts (checking + savings)
    const { data: accounts, error: accountsError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .in('account_type', ['checking', 'savings']);

    if (accountsError) throw accountsError;

    const totalCash = accounts?.reduce((sum, acc) => 
      sum + (acc.current_balance || acc.balance || 0), 0
    ) || 0;

    // Calculate upcoming bills (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: upcomingDebts } = await supabase
      .from('debts')
      .select('monthly_payment')
      .eq('user_id', user.id);

    const upcomingBills = (upcomingDebts?.reduce((sum, debt) => 
      sum + (debt.monthly_payment || 0), 0
    ) || 0);

    // Calculate average daily spend from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .lt('amount', 0) // Only debits
      .gte('date', thirtyDaysAgo.toISOString());

    const totalSpent = recentTransactions?.reduce((sum, tx) => 
      sum + Math.abs(tx.amount), 0
    ) || 0;
    const dailySpendAvg = totalSpent / 30;

    // Calculate safe to spend and runway
    const safeToSpend = Math.max(0, totalCash - upcomingBills);
    const runway = dailySpendAvg > 0 ? Math.floor(safeToSpend / dailySpendAvg) : 999;

    return new Response(JSON.stringify({
      totalCash,
      upcomingBills,
      safeToSpend,
      dailySpendAvg,
      runway,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-liquidity:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});