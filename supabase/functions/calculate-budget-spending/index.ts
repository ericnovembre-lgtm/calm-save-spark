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

    const { budget_id, period_start, period_end } = await req.json();

    if (!budget_id || !period_start || !period_end) {
      throw new Error('Missing required parameters: budget_id, period_start, period_end');
    }

    // Get budget details
    const { data: budget, error: budgetError } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('id', budget_id)
      .eq('user_id', user.id)
      .single();

    if (budgetError || !budget) {
      throw new Error('Budget not found');
    }

    const categoryLimits = budget.category_limits as { [key: string]: number };
    const categories = Object.keys(categoryLimits);

    // Fetch transactions within the period for these categories
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', period_start)
      .lte('transaction_date', period_end)
      .in('category', categories);

    if (txError) {
      console.error('Error fetching transactions:', txError);
      throw txError;
    }

    // Calculate total spent
    const totalSpent = transactions?.reduce((sum, tx) => {
      const amount = parseFloat(String(tx.amount));
      return sum + Math.abs(amount);
    }, 0) || 0;

    const transactionCount = transactions?.length || 0;

    // Upsert budget_spending record
    const { data: spendingRecord, error: spendingError } = await supabaseClient
      .from('budget_spending')
      .upsert({
        user_id: user.id,
        budget_id: budget_id,
        period_start: period_start,
        period_end: period_end,
        spent_amount: totalSpent,
        transaction_count: transactionCount,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'budget_id,period_start,period_end'
      })
      .select()
      .single();

    if (spendingError) {
      console.error('Error upserting spending:', spendingError);
      throw spendingError;
    }

    // Calculate analytics
    const categoryBreakdown: { [key: string]: number } = {};
    transactions?.forEach(tx => {
      const category = tx.category;
      const amount = Math.abs(parseFloat(String(tx.amount)));
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
    });

    const percentage = budget.total_limit > 0 ? (totalSpent / budget.total_limit) * 100 : 0;
    const remaining = budget.total_limit - totalSpent;

    return new Response(
      JSON.stringify({
        success: true,
        spending: spendingRecord,
        analytics: {
          total_spent: totalSpent,
          total_budget: budget.total_limit,
          remaining: remaining,
          percentage: percentage,
          transaction_count: transactionCount,
          category_breakdown: categoryBreakdown,
          is_over_budget: totalSpent > budget.total_limit,
          is_near_limit: percentage >= 80
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Calculate Budget Spending Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
