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

    console.log('Processing challenge rewards...');

    // Find completed challenges
    const { data: completedParticipants } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        community_challenges(*)
      `)
      .eq('is_completed', true)
      .is('rewarded_at', null);

    if (!completedParticipants || completedParticipants.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No rewards to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Award points for completed challenges
    for (const participant of completedParticipants) {
      const challenge = participant.community_challenges;
      const points = challenge.reward_points || 100;

      // Check if user already earned achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', participant.user_id)
        .eq('achievement_id', (await supabase
          .from('achievements')
          .select('id')
          .eq('achievement_type', 'challenge_completed')
          .single()).data?.id || '')
        .single();

      if (!existingAchievement) {
        // Award achievement
        const { data: achievement } = await supabase
          .from('achievements')
          .select('id')
          .eq('achievement_type', 'challenge_completed')
          .single();

        if (achievement) {
          await supabase.from('user_achievements').insert({
            user_id: participant.user_id,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString(),
            points_earned: points
          } as any);
        }
      }

      // Mark as rewarded
      await supabase
        .from('challenge_participants')
        .update({ rewarded_at: new Date().toISOString() } as any)
        .eq('id', participant.id);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Rewards processed successfully',
        count: completedParticipants.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing rewards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});