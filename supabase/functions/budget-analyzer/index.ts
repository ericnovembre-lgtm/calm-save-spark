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

    // Get time period from query params or default to last 30 days
    const url = new URL(req.url);
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', startDate.toISOString())
      .order('transaction_date', { ascending: false });

    // Analyze spending by category
    const categorySpending: { [key: string]: number } = {};
    let totalSpending = 0;

    transactions?.forEach(tx => {
      const amount = Math.abs(parseFloat(String(tx.amount)));
      if (amount > 0 && tx.category) {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + amount;
        totalSpending += amount;
      }
    });

    // Calculate percentages
    const categoryPercentages: { [key: string]: number } = {};
    Object.keys(categorySpending).forEach(cat => {
      categoryPercentages[cat] = totalSpending > 0 ? (categorySpending[cat] / totalSpending) * 100 : 0;
    });

    // Get all user's active budgets
    const { data: activeBudgets } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Get budget spending records
    const { data: budgetSpending } = await supabaseClient
      .from('budget_spending')
      .select('*')
      .eq('user_id', user.id);

    // Compare to budgets
    const budgetComparison: any[] = [];
    let totalBudgeted = 0;
    let totalOverBudget = 0;

    if (activeBudgets && activeBudgets.length > 0) {
      activeBudgets.forEach(budget => {
        const categoryLimits = budget.category_limits as { [key: string]: number };
        const budgetTotal = budget.total_limit;
        totalBudgeted += budgetTotal;

        // Find spending record for this budget
        const spending = budgetSpending?.find(s => s.budget_id === budget.id);
        const spent = spending?.spent_amount || 0;
        const percentage = budgetTotal > 0 ? (spent / budgetTotal) * 100 : 0;
        const overBudget = spent > budgetTotal;

        if (overBudget) {
          totalOverBudget += (spent - budgetTotal);
        }

        budgetComparison.push({
          budget_id: budget.id,
          budget_name: budget.name,
          period: budget.period,
          budgeted: budgetTotal,
          spent: spent,
          remaining: budgetTotal - spent,
          percentage: percentage,
          over_budget: overBudget,
          transaction_count: spending?.transaction_count || 0
        });
      });
    }

    // Generate insights
    const insights = [];
    
    // Find highest spending category
    if (Object.keys(categorySpending).length > 0) {
      const highestCat = Object.keys(categorySpending).reduce((a, b) => 
        categorySpending[a] > categorySpending[b] ? a : b
      );
      insights.push({
        type: 'high_spending',
        message: `Your highest spending category is ${highestCat} at $${categorySpending[highestCat].toFixed(2)} (${categoryPercentages[highestCat].toFixed(1)}% of total)`,
        category: highestCat,
        amount: categorySpending[highestCat]
      });
    }

    // Check for overspending
    const overBudgetItems = budgetComparison.filter(c => c.over_budget);
    if (overBudgetItems.length > 0) {
      insights.push({
        type: 'over_budget',
        message: `You're over budget in ${overBudgetItems.length} budget${overBudgetItems.length > 1 ? 's' : ''}`,
        count: overBudgetItems.length,
        total_over: totalOverBudget,
        budgets: overBudgetItems.map(b => b.budget_name)
      });
    }

    // Near limit warnings
    const nearLimitBudgets = budgetComparison.filter(c => !c.over_budget && c.percentage >= 80);
    if (nearLimitBudgets.length > 0) {
      insights.push({
        type: 'near_limit',
        message: `${nearLimitBudgets.length} budget${nearLimitBudgets.length > 1 ? 's are' : ' is'} near the limit (80%+)`,
        budgets: nearLimitBudgets.map(b => ({
          name: b.budget_name,
          percentage: b.percentage.toFixed(1)
        }))
      });
    }

    // Suggest budget if none exists
    if (!activeBudgets || activeBudgets.length === 0) {
      insights.push({
        type: 'no_budget',
        message: 'Consider creating a budget based on your spending patterns',
        suggested_monthly_budget: Math.ceil(totalSpending * (30 / days))
      });
    }

    // Spending trend insight
    if (transactions && transactions.length >= 7) {
      const recentWeek = transactions.slice(0, 7).reduce((sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))), 0);
      const previousWeek = transactions.slice(7, 14).reduce((sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))), 0);
      
      if (previousWeek > 0) {
        const trendChange = ((recentWeek - previousWeek) / previousWeek) * 100;
        if (Math.abs(trendChange) > 10) {
          insights.push({
            type: 'spending_trend',
            message: trendChange > 0 
              ? `Spending increased by ${trendChange.toFixed(1)}% compared to last week`
              : `Spending decreased by ${Math.abs(trendChange).toFixed(1)}% compared to last week`,
            trend: trendChange > 0 ? 'up' : 'down',
            percentage: Math.abs(trendChange)
          });
        }
      }
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
