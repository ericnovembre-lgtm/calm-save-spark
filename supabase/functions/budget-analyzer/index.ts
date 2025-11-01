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

    // Fetch transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', thirtyDaysAgo.toISOString());

    // Analyze spending by category
    const categorySpending: { [key: string]: number } = {};
    let totalSpending = 0;

    transactions?.forEach(tx => {
      const amount = parseFloat(String(tx.amount));
      if (amount > 0) {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + amount;
        totalSpending += amount;
      }
    });

    // Calculate percentages
    const categoryPercentages: { [key: string]: number } = {};
    Object.keys(categorySpending).forEach(cat => {
      categoryPercentages[cat] = (categorySpending[cat] / totalSpending) * 100;
    });

    // Get user's active budget
    const { data: activeBudget } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // Compare to budget if exists
    let budgetComparison = null;
    if (activeBudget) {
      const categoryLimits = activeBudget.category_limits as { [key: string]: number };
      budgetComparison = Object.keys(categorySpending).map(cat => ({
        category: cat,
        spent: categorySpending[cat],
        budgeted: categoryLimits[cat] || 0,
        percentage: categoryLimits[cat] ? (categorySpending[cat] / categoryLimits[cat]) * 100 : 100,
        over_budget: categorySpending[cat] > (categoryLimits[cat] || 0)
      }));
    }

    // Generate insights
    const insights = [];
    
    // Find highest spending category
    const highestCat = Object.keys(categorySpending).reduce((a, b) => 
      categorySpending[a] > categorySpending[b] ? a : b
    );
    insights.push({
      type: 'high_spending',
      message: `Your highest spending category is ${highestCat} at $${categorySpending[highestCat].toFixed(2)} (${categoryPercentages[highestCat].toFixed(1)}% of total)`,
      category: highestCat
    });

    // Check for overspending
    if (budgetComparison) {
      const overBudget = budgetComparison.filter(c => c.over_budget);
      if (overBudget.length > 0) {
        insights.push({
          type: 'over_budget',
          message: `You're over budget in ${overBudget.length} categories`,
          categories: overBudget.map(c => c.category)
        });
      }
    }

    // Suggest budget if none exists
    if (!activeBudget) {
      insights.push({
        type: 'no_budget',
        message: 'Consider creating a budget based on your spending patterns',
        suggested_template: 'medium'
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        spending_by_category: categorySpending,
        category_percentages: categoryPercentages,
        total_spending: totalSpending,
        budget_comparison: budgetComparison,
        insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Budget Analyzer Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
