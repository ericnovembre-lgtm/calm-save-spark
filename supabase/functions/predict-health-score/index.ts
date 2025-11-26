import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthPrediction {
  current_score: number;
  predicted_30d: number;
  predicted_60d: number;
  predicted_90d: number;
  factors: {
    factor: string;
    impact: number;
    trend: 'improving' | 'stable' | 'declining';
    description: string;
  }[];
  recommendations: {
    action: string;
    impact_score: number;
    priority: 'high' | 'medium' | 'low';
  }[];
}

Deno.serve(async (req) => {
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prediction = await predictHealthScore(supabase, user.id);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Health prediction error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function predictHealthScore(supabase: any, userId: string): Promise<HealthPrediction> {
  // Calculate current health score
  const currentScore = await calculateCurrentHealthScore(supabase, userId);

  // Get spending trends
  const spendingTrend = await getSpendingTrend(supabase, userId);
  const savingsTrend = await getSavingsTrend(supabase, userId);
  const budgetCompliance = await getBudgetCompliance(supabase, userId);
  const goalProgress = await getGoalProgress(supabase, userId);

  // Predict future scores based on trends
  const predicted30d = predictScore(currentScore, spendingTrend, savingsTrend, budgetCompliance, 30);
  const predicted60d = predictScore(currentScore, spendingTrend, savingsTrend, budgetCompliance, 60);
  const predicted90d = predictScore(currentScore, spendingTrend, savingsTrend, budgetCompliance, 90);

  // Analyze factors
  const factors = [
    {
      factor: 'Spending Trend',
      impact: spendingTrend.impact,
      trend: spendingTrend.direction as 'improving' | 'stable' | 'declining',
      description: spendingTrend.description,
    },
    {
      factor: 'Savings Rate',
      impact: savingsTrend.impact,
      trend: savingsTrend.direction as 'improving' | 'stable' | 'declining',
      description: savingsTrend.description,
    },
    {
      factor: 'Budget Compliance',
      impact: budgetCompliance.impact,
      trend: budgetCompliance.direction as 'improving' | 'stable' | 'declining',
      description: budgetCompliance.description,
    },
    {
      factor: 'Goal Progress',
      impact: goalProgress.impact,
      trend: goalProgress.direction as 'improving' | 'stable' | 'declining',
      description: goalProgress.description,
    },
  ];

  // Generate recommendations
  const recommendations = generateRecommendations(factors, currentScore);

  return {
    current_score: currentScore,
    predicted_30d: predicted30d,
    predicted_60d: predicted60d,
    predicted_90d: predicted90d,
    factors,
    recommendations,
  };
}

async function calculateCurrentHealthScore(supabase: any, userId: string): Promise<number> {
  // Simplified health score calculation (0-100)
  let score = 50; // Start at neutral

  // Factor 1: Savings rate (+/- 20 points)
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (recentTransactions && recentTransactions.length > 0) {
    const totalSpending = recentTransactions
      .filter((t: any) => t.amount < 0)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    const totalIncome = recentTransactions
      .filter((t: any) => t.amount > 0)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    if (totalIncome > 0) {
      const savingsRate = 1 - totalSpending / totalIncome;
      score += Math.min(savingsRate * 40, 20); // Up to 20 points
    }
  }

  // Factor 2: Budget compliance (+/- 15 points)
  const { data: budgets } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId);

  if (budgets && budgets.length > 0) {
    const overBudgetCount = budgets.filter((b: any) => b.spent > b.amount).length;
    const complianceRate = 1 - overBudgetCount / budgets.length;
    score += complianceRate * 15;
  }

  // Factor 3: Goal progress (+/- 15 points)
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId);

  if (goals && goals.length > 0) {
    const avgProgress =
      goals.reduce((sum: number, g: any) => sum + (g.current_amount / g.target_amount), 0) /
      goals.length;
    score += Math.min(avgProgress * 30, 15);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

async function getSpendingTrend(supabase: any, userId: string) {
  const { data: last30 } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .lt('amount', 0)
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: prev30 } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .lt('amount', 0)
    .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .lt('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const last30Total = last30?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;
  const prev30Total = prev30?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

  const change = prev30Total > 0 ? (last30Total - prev30Total) / prev30Total : 0;

  return {
    impact: Math.abs(change) * 10,
    direction: change < -0.05 ? 'improving' : change > 0.05 ? 'declining' : 'stable',
    description: `Spending ${change < -0.05 ? 'decreased' : change > 0.05 ? 'increased' : 'stable'} by ${Math.abs(change * 100).toFixed(0)}%`,
  };
}

async function getSavingsTrend(supabase: any, userId: string) {
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('current_amount, target_amount')
    .eq('user_id', userId);

  const avgProgress = goals && goals.length > 0
    ? goals.reduce((sum: number, g: any) => sum + (g.current_amount / g.target_amount), 0) / goals.length
    : 0;

  return {
    impact: avgProgress * 15,
    direction: avgProgress > 0.7 ? 'improving' : avgProgress > 0.3 ? 'stable' : 'declining',
    description: `Average goal progress: ${(avgProgress * 100).toFixed(0)}%`,
  };
}

async function getBudgetCompliance(supabase: any, userId: string) {
  const { data: budgets } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId);

  if (!budgets || budgets.length === 0) {
    return { impact: 0, direction: 'stable', description: 'No budgets set' };
  }

  const overBudgetCount = budgets.filter((b: any) => b.spent > b.amount).length;
  const complianceRate = 1 - overBudgetCount / budgets.length;

  return {
    impact: complianceRate * 15,
    direction: complianceRate > 0.8 ? 'improving' : complianceRate > 0.5 ? 'stable' : 'declining',
    description: `${(complianceRate * 100).toFixed(0)}% of budgets on track`,
  };
}

async function getGoalProgress(supabase: any, userId: string) {
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId);

  if (!goals || goals.length === 0) {
    return { impact: 0, direction: 'stable', description: 'No goals set' };
  }

  const avgProgress =
    goals.reduce((sum: number, g: any) => sum + (g.current_amount / g.target_amount), 0) /
    goals.length;

  return {
    impact: avgProgress * 15,
    direction: avgProgress > 0.7 ? 'improving' : avgProgress > 0.3 ? 'stable' : 'declining',
    description: `Average goal completion: ${(avgProgress * 100).toFixed(0)}%`,
  };
}

function predictScore(
  currentScore: number,
  spendingTrend: any,
  savingsTrend: any,
  budgetCompliance: any,
  daysAhead: number
): number {
  let prediction = currentScore;

  // Apply trend adjustments weighted by time
  const timeFactor = daysAhead / 30;

  if (spendingTrend.direction === 'declining') {
    prediction -= spendingTrend.impact * timeFactor * 0.5;
  } else if (spendingTrend.direction === 'improving') {
    prediction += spendingTrend.impact * timeFactor * 0.5;
  }

  if (savingsTrend.direction === 'improving') {
    prediction += savingsTrend.impact * timeFactor * 0.3;
  } else if (savingsTrend.direction === 'declining') {
    prediction -= savingsTrend.impact * timeFactor * 0.3;
  }

  if (budgetCompliance.direction === 'declining') {
    prediction -= budgetCompliance.impact * timeFactor * 0.2;
  }

  return Math.round(Math.max(0, Math.min(100, prediction)));
}

function generateRecommendations(factors: any[], currentScore: number) {
  const recommendations = [];

  // Find weakest factors
  const sortedFactors = [...factors].sort((a, b) => a.impact - b.impact);

  for (const factor of sortedFactors.slice(0, 3)) {
    if (factor.trend === 'declining' || factor.impact < 5) {
      if (factor.factor === 'Spending Trend') {
        recommendations.push({
          action: 'Review and reduce discretionary spending',
          impact_score: 15,
          priority: 'high' as const,
        });
      } else if (factor.factor === 'Savings Rate') {
        recommendations.push({
          action: 'Increase automated savings by 5%',
          impact_score: 12,
          priority: 'high' as const,
        });
      } else if (factor.factor === 'Budget Compliance') {
        recommendations.push({
          action: 'Review and adjust budget allocations',
          impact_score: 10,
          priority: 'medium' as const,
        });
      } else if (factor.factor === 'Goal Progress') {
        recommendations.push({
          action: 'Set up recurring contributions to goals',
          impact_score: 8,
          priority: 'medium' as const,
        });
      }
    }
  }

  if (currentScore < 60) {
    recommendations.unshift({
      action: 'Schedule financial review session',
      impact_score: 20,
      priority: 'high' as const,
    });
  }

  return recommendations.slice(0, 5);
}