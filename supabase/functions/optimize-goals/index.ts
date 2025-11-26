import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch user's goals
    const { data: goals } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true });

    if (!goals || goals.length === 0) {
      return new Response(JSON.stringify({ 
        optimizations: [],
        message: 'No active goals to optimize'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch recent income/cash flow
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(100);

    // Calculate disposable income
    const monthlyIncome = calculateMonthlyIncome(transactions || []);
    const monthlyExpenses = calculateMonthlyExpenses(transactions || []);
    const disposableIncome = monthlyIncome - monthlyExpenses;

    // Optimize goal allocations
    const optimizations = optimizeGoalAllocations(goals, disposableIncome);

    // Generate strategic recommendations
    const recommendations = generateRecommendations(goals, optimizations, disposableIncome);

    return new Response(JSON.stringify({
      optimizations,
      recommendations,
      summary: {
        totalGoals: goals.length,
        monthlyDisposable: disposableIncome,
        totalMonthlyAllocation: optimizations.reduce((sum, o) => sum + o.suggestedMonthlyAmount, 0),
        averageCompletionTime: calculateAverageCompletion(optimizations)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateMonthlyIncome(transactions: any[]): number {
  const last30Days = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && t.amount < 0; // Negative = income
  });

  const totalIncome = last30Days.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return totalIncome;
}

function calculateMonthlyExpenses(transactions: any[]): number {
  const last30Days = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && t.amount > 0; // Positive = expense
  });

  const totalExpenses = last30Days.reduce((sum, t) => sum + t.amount, 0);
  return totalExpenses;
}

function optimizeGoalAllocations(goals: any[], disposableIncome: number): any[] {
  const optimizations: any[] = [];
  const activeGoals = goals.filter(g => g.current_amount < g.target_amount);

  if (activeGoals.length === 0) return optimizations;

  // Calculate priority scores
  const scoredGoals = activeGoals.map(goal => {
    const remainingAmount = goal.target_amount - goal.current_amount;
    const daysUntilDeadline = goal.deadline 
      ? Math.max(1, Math.floor((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 365;

    // Priority factors
    const urgencyScore = 1 / (daysUntilDeadline / 30); // Higher if closer deadline
    const completionScore = goal.current_amount / goal.target_amount; // Higher if closer to completion
    const sizeScore = 1 / (remainingAmount / 1000); // Higher for smaller remaining amounts

    return {
      ...goal,
      remainingAmount,
      daysUntilDeadline,
      priorityScore: (urgencyScore * 0.5) + (completionScore * 0.3) + (sizeScore * 0.2)
    };
  });

  // Sort by priority
  scoredGoals.sort((a, b) => b.priorityScore - a.priorityScore);

  // Allocate income using weighted distribution
  let remainingIncome = disposableIncome * 0.6; // Use 60% for goals
  const totalPriorityScore = scoredGoals.reduce((sum, g) => sum + g.priorityScore, 0);

  scoredGoals.forEach(goal => {
    const allocationRatio = goal.priorityScore / totalPriorityScore;
    const suggestedMonthly = Math.min(
      remainingIncome * allocationRatio,
      goal.remainingAmount / (goal.daysUntilDeadline / 30)
    );

    const monthsToComplete = goal.remainingAmount / suggestedMonthly;
    const estimatedCompletion = new Date();
    estimatedCompletion.setMonth(estimatedCompletion.getMonth() + Math.ceil(monthsToComplete));

    optimizations.push({
      goalId: goal.id,
      goalName: goal.name,
      currentAmount: goal.current_amount,
      targetAmount: goal.target_amount,
      remainingAmount: goal.remainingAmount,
      suggestedMonthlyAmount: Math.round(suggestedMonthly * 100) / 100,
      suggestedWeeklyAmount: Math.round((suggestedMonthly / 4) * 100) / 100,
      estimatedCompletion: estimatedCompletion.toISOString(),
      priorityScore: Math.round(goal.priorityScore * 100) / 100,
      onTrack: goal.deadline ? new Date(goal.deadline) >= estimatedCompletion : true
    });

    remainingIncome -= suggestedMonthly;
  });

  return optimizations;
}

function generateRecommendations(goals: any[], optimizations: any[], disposableIncome: number): any[] {
  const recommendations: any[] = [];

  // Recommendation 1: Consolidate small goals
  const smallGoals = optimizations.filter(o => o.remainingAmount < 500);
  if (smallGoals.length >= 2) {
    recommendations.push({
      type: 'consolidate',
      priority: 'high',
      title: 'Consolidate Small Goals',
      description: `Focus on completing ${smallGoals.length} small goals first to build momentum`,
      action: 'Increase allocation to small goals temporarily',
      impact: 'Reduce cognitive load and achieve quick wins'
    });
  }

  // Recommendation 2: High urgency goals
  const urgentGoals = optimizations.filter(o => !o.onTrack);
  if (urgentGoals.length > 0) {
    recommendations.push({
      type: 'urgency',
      priority: 'critical',
      title: 'Urgent Goals Need Attention',
      description: `${urgentGoals.length} goal(s) won't meet deadline at current pace`,
      action: 'Increase monthly allocation or extend deadline',
      impact: 'Avoid missing important financial targets'
    });
  }

  // Recommendation 3: Income optimization
  const totalAllocated = optimizations.reduce((sum, o) => sum + o.suggestedMonthlyAmount, 0);
  const utilizationRate = totalAllocated / (disposableIncome * 0.6);
  
  if (utilizationRate < 0.7) {
    recommendations.push({
      type: 'underutilized',
      priority: 'medium',
      title: 'Increase Savings Rate',
      description: `You're only allocating ${Math.round(utilizationRate * 100)}% of available savings capacity`,
      action: `Add $${Math.round((disposableIncome * 0.6 - totalAllocated) * 100) / 100}/month to goals`,
      impact: 'Accelerate goal completion by 20-30%'
    });
  }

  // Recommendation 4: Goal diversity
  if (goals.length < 3) {
    recommendations.push({
      type: 'diversity',
      priority: 'low',
      title: 'Diversify Your Goals',
      description: 'Consider adding different goal types (emergency fund, vacation, etc.)',
      action: 'Create 1-2 additional goals in different categories',
      impact: 'Build a more balanced financial foundation'
    });
  }

  return recommendations;
}

function calculateAverageCompletion(optimizations: any[]): number {
  if (optimizations.length === 0) return 0;
  
  const totalMonths = optimizations.reduce((sum, o) => {
    const monthsRemaining = o.remainingAmount / o.suggestedMonthlyAmount;
    return sum + monthsRemaining;
  }, 0);

  return Math.round((totalMonths / optimizations.length) * 10) / 10;
}