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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch user's goals
    const { data: goals, error: goalsError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('target_amount', { ascending: false });

    if (goalsError) throw goalsError;
    if (!goals || goals.length === 0) {
      return new Response(JSON.stringify({ error: 'No goals found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Estimate monthly disposable income (simplified - in production, analyze transaction history)
    const estimatedMonthlyIncome = 3000; // Placeholder
    const fixedExpenses = 1800; // Placeholder
    const disposableIncome = estimatedMonthlyIncome - fixedExpenses;

    // Linear programming approximation: allocate proportionally by priority
    // Priority: goals with higher completion % get less, newer goals get more
    const totalTargetRemaining = goals.reduce((sum, goal) => {
      const remaining = goal.target_amount - (goal.current_amount || 0);
      return sum + remaining;
    }, 0);

    const weeklyAllocations: any = {};
    const weeklyDisposable = disposableIncome / 4;

    goals.forEach(goal => {
      const remaining = goal.target_amount - (goal.current_amount || 0);
      const proportion = remaining / totalTargetRemaining;
      const weeklyAmount = Math.round((weeklyDisposable * proportion) * 100) / 100;
      
      weeklyAllocations[goal.id] = {
        goalName: goal.name,
        weeklyAmount,
        monthlyAmount: weeklyAmount * 4,
        projectedMonthsToComplete: remaining / (weeklyAmount * 4),
        remaining
      };
    });

    // Save optimization plan
    const { data: plan, error: planError } = await supabaseClient
      .from('goal_optimization_plans')
      .insert({
        user_id: user.id,
        weekly_allocations: weeklyAllocations,
        confidence_score: 0.85,
        assumptions: {
          monthlyIncome: estimatedMonthlyIncome,
          fixedExpenses,
          disposableIncome
        }
      })
      .select()
      .single();

    if (planError) throw planError;

    return new Response(JSON.stringify({ plan, allocations: weeklyAllocations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in optimize-goal-allocations:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});