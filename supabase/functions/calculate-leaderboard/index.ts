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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Calculating leaderboards...');

    // Calculate total savings leaderboard
    const { data: savingsData } = await supabase
      .from('goals')
      .select('user_id, current_amount');

    const savingsByUser = new Map<string, number>();
    savingsData?.forEach(goal => {
      const current = savingsByUser.get(goal.user_id) || 0;
      savingsByUser.set(goal.user_id, current + parseFloat(goal.current_amount.toString()));
    });

    const savingsLeaderboard = Array.from(savingsByUser.entries())
      .map(([user_id, score]) => ({ user_id, score }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        leaderboard_type: 'global',
        category: 'total_savings',
        user_id: entry.user_id,
        score: entry.score,
        rank: index + 1,
        time_period: 'all_time'
      }));

    // Calculate challenges completed leaderboard
    const { data: challengesData } = await supabase
      .from('challenge_participants')
      .select('user_id, is_completed');

    const challengesByUser = new Map<string, number>();
    challengesData?.forEach(participant => {
      if (participant.is_completed) {
        const current = challengesByUser.get(participant.user_id) || 0;
        challengesByUser.set(participant.user_id, current + 1);
      }
    });

    const challengesLeaderboard = Array.from(challengesByUser.entries())
      .map(([user_id, score]) => ({ user_id, score }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        leaderboard_type: 'global',
        category: 'challenges_completed',
        user_id: entry.user_id,
        score: entry.score,
        rank: index + 1,
        time_period: 'all_time'
      }));

    // Delete old leaderboard entries
    await supabase.from('leaderboards').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new leaderboard entries
    const allEntries = [...savingsLeaderboard, ...challengesLeaderboard];
    if (allEntries.length > 0) {
      await supabase.from('leaderboards').insert(allEntries as any);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Leaderboards calculated successfully',
        entries: allEntries.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating leaderboards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});