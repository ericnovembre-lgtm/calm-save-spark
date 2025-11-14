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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all active goals
    const { data: goals, error: goalsError } = await supabaseClient
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (goalsError) throw goalsError;
    if (!goals || goals.length === 0) {
      return new Response(JSON.stringify({ message: 'No goals to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const efficiencyScores: any[] = [];

    for (const goal of goals) {
      const createdAt = new Date(goal.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation < 1) continue; // Skip brand new goals

      // Calculate expected progress (linear assumption)
      const targetAmount = goal.target_amount;
      const currentAmount = goal.current_amount || 0;
      const actualProgress = (currentAmount / targetAmount) * 100;

      // Expected progress based on deadline (if set) or default 12-month timeline
      let expectedProgress = 0;
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const totalDays = Math.floor((deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        expectedProgress = (daysSinceCreation / totalDays) * 100;
      } else {
        // Default: assume 12-month goal
        const totalDays = 365;
        expectedProgress = (daysSinceCreation / totalDays) * 100;
      }

      // Calculate efficiency score
      const efficiencyScore = expectedProgress > 0 ? (actualProgress / expectedProgress) : 1.0;

      // Determine badge
      let badge: string;
      if (efficiencyScore >= 1.1) badge = 'hot';
      else if (efficiencyScore >= 0.9) badge = 'on_track';
      else if (efficiencyScore >= 0.7) badge = 'behind';
      else badge = 'frozen';

      // Upsert efficiency score
      const { error: insertError } = await supabaseClient
        .from('goal_efficiency_scores')
        .upsert({
          goal_id: goal.id,
          efficiency_score: Math.round(efficiencyScore * 100) / 100,
          badge,
          expected_progress: Math.round(expectedProgress * 100) / 100,
          actual_progress: Math.round(actualProgress * 100) / 100,
          calculated_at: new Date().toISOString()
        }, {
          onConflict: 'goal_id',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('Error inserting efficiency score:', insertError);
        continue;
      }

      efficiencyScores.push({
        goalId: goal.id,
        goalName: goal.name,
        efficiencyScore,
        badge
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: efficiencyScores.length,
      scores: efficiencyScores
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-goal-efficiency:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});