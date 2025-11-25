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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch user's current progress
    const { data: userAchievements } = await supabaseClient
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id);

    const { data: allAchievements } = await supabaseClient
      .from('achievements')
      .select('*')
      .order('points', { ascending: true });

    const { data: questlineProgress } = await supabaseClient
      .from('user_questline_progress')
      .select('*, financial_questlines(*)')
      .eq('user_id', user.id)
      .is('completed_at', null);

    const { data: geoPartners } = await supabaseClient
      .from('geo_reward_partners')
      .select('*')
      .eq('is_active', true)
      .gte('current_multiplier', 2.0)
      .limit(1);

    // Calculate nearest achievement
    const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || []);
    const nextAchievement = allAchievements?.find(a => !earnedIds.has(a.id));

    // Generate contextual message
    let message = '';
    let progress = 0;

    if (questlineProgress && questlineProgress.length > 0) {
      const questline = questlineProgress[0];
      const totalSteps = (questline.financial_questlines?.steps as any[])?.length || 0;
      const completedSteps = (questline.steps_completed as number[])?.length || 0;
      progress = Math.round((completedSteps / totalSteps) * 100);
      
      message = `You're ${progress}% through "${questline.financial_questlines?.name}"—complete the next chapter to unlock your next reward!`;
    } else if (geoPartners && geoPartners.length > 0) {
      const partner = geoPartners[0];
      message = `${partner.current_multiplier}x points active at ${partner.name}! Visit today to maximize your rewards.`;
      progress = 75; // Indicate high opportunity
    } else if (nextAchievement) {
      const totalPoints = userAchievements?.reduce((sum, a) => sum + (a.achievements?.points || 0), 0) || 0;
      const pointsNeeded = nextAchievement.points - totalPoints;
      
      if (pointsNeeded > 0) {
        message = `You're ${pointsNeeded} points away from unlocking "${nextAchievement.name}"—stay on pace for a 2x boost this week.`;
        progress = Math.round((totalPoints / nextAchievement.points) * 100);
      } else {
        message = `Great momentum! Keep up your current pace to maintain your streak multiplier.`;
        progress = 85;
      }
    } else {
      message = `You're crushing it! Continue building your streak for exclusive quarterly rewards.`;
      progress = 90;
    }

    return new Response(
      JSON.stringify({ 
        message,
        progress,
        nextReward: nextAchievement?.name || null,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in reward-coach-nudge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
