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

    const { event_type, metadata = {} } = await req.json();

    console.log(`Checking achievements for event: ${event_type}`, metadata);

    const newAchievements = [];

    // Get all achievements user hasn't earned yet
    const { data: earnedIds } = await supabaseClient
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const earnedSet = new Set(earnedIds?.map(a => a.achievement_id) || []);

    const { data: allAchievements } = await supabaseClient
      .from('achievements')
      .select('*');

    // Check each achievement
    for (const achievement of allAchievements || []) {
      if (earnedSet.has(achievement.id)) continue;

      let earned = false;

      switch (achievement.achievement_type) {
        case 'onboarding':
          if (event_type === 'onboarding_completed') earned = true;
          break;

        case 'first_save':
          if (event_type === 'transfer_completed' && metadata.amount > 0) earned = true;
          break;

        case 'milestone_saver': {
          const { data: transfers } = await supabaseClient
            .from('transfer_history')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'completed');
          
          const totalSaved = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          const required = achievement.requirement.total || 0;
          if (totalSaved >= required) earned = true;
          break;
        }

        case 'automation':
          if (event_type === 'automation_created') {
            const { data: rules } = await supabaseClient
              .from('automation_rules')
              .select('id')
              .eq('user_id', user.id);
            
            const required = achievement.requirement.rules || 0;
            if ((rules?.length || 0) >= required) earned = true;
          }
          break;

        case 'account_connect':
          if (event_type === 'account_connected') {
            const { data: accounts } = await supabaseClient
              .from('connected_accounts')
              .select('id')
              .eq('user_id', user.id);
            
            const required = achievement.requirement.accounts || 0;
            if ((accounts?.length || 0) >= required) earned = true;
          }
          break;
      }

      if (earned) {
        await supabaseClient
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            metadata: { event_type, ...metadata },
          });

        newAchievements.push(achievement);
        console.log(`Achievement earned: ${achievement.name}`);
      }
    }

    // Update challenge progress
    if (event_type === 'transfer_completed') {
      await updateStreaks(supabaseClient, user.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        new_achievements: newAchievements,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking achievements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function updateStreaks(supabaseClient: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data: streak } = await supabaseClient
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', 'daily_save')
    .single();

  if (!streak) {
    await supabaseClient.from('user_streaks').insert({
      user_id: userId,
      streak_type: 'daily_save',
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
  } else {
    const lastDate = new Date(streak.last_activity_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      const newStreak = streak.current_streak + 1;
      await supabaseClient
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_activity_date: today,
        })
        .eq('id', streak.id);
    } else if (diffDays > 1) {
      // Streak broken
      await supabaseClient
        .from('user_streaks')
        .update({
          current_streak: 1,
          last_activity_date: today,
        })
        .eq('id', streak.id);
    }
    // Same day - no update needed
  }
}