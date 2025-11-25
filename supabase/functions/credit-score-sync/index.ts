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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json().catch(() => ({}));
    const isCronJob = body.cron === true;

    if (isCronJob) {
      // Cron job: sync all users' credit scores
      console.log('Cron job triggered - syncing all users credit scores');
      
      const { data: users } = await supabaseClient
        .from('profiles')
        .select('id');

      let successCount = 0;
      let failCount = 0;

      for (const userProfile of users || []) {
        try {
          // Get previous score
          const { data: previousScores } = await supabaseClient
            .from('credit_scores')
            .select('*')
            .eq('user_id', userProfile.id)
            .order('score_date', { ascending: false })
            .limit(1);

          const previousScore = previousScores?.[0];
          const baseScore = previousScore?.score || 680;
          const change = Math.floor(Math.random() * 21) - 10;
          const newScore = Math.max(300, Math.min(850, baseScore + change));

          const factors = [
            { factor: 'Payment History', impact: 'positive', weight: 35 },
            { factor: 'Credit Utilization', impact: newScore < 700 ? 'negative' : 'positive', weight: 30 },
            { factor: 'Length of Credit History', impact: 'neutral', weight: 15 },
            { factor: 'Credit Mix', impact: 'positive', weight: 10 },
            { factor: 'New Credit', impact: 'neutral', weight: 10 }
          ];

          await supabaseClient
            .from('credit_scores')
            .insert({
              user_id: userProfile.id,
              score: newScore,
              provider: 'Simulated Provider',
              score_date: new Date().toISOString(),
              change_from_previous: previousScore ? newScore - previousScore.score : 0,
              factors
            });

          successCount++;
        } catch (error) {
          console.error(`Failed to sync credit score for user ${userProfile.id}:`, error);
          failCount++;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Cron job completed',
          users_synced: successCount,
          failed: failCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User request: sync only this user's credit score
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get previous score
    const { data: previousScores } = await supabaseClient
      .from('credit_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(1);

    const previousScore = previousScores?.[0];

    // TODO: Integrate with Experian API or Credit Karma API
    // For now, simulate credit score update
    const baseScore = previousScore?.score || 680;
    const change = Math.floor(Math.random() * 21) - 10; // -10 to +10 change
    const newScore = Math.max(300, Math.min(850, baseScore + change));

    const factors = [
      { factor: 'Payment History', impact: 'positive', weight: 35 },
      { factor: 'Credit Utilization', impact: newScore < 700 ? 'negative' : 'positive', weight: 30 },
      { factor: 'Length of Credit History', impact: 'neutral', weight: 15 },
      { factor: 'Credit Mix', impact: 'positive', weight: 10 },
      { factor: 'New Credit', impact: 'neutral', weight: 10 }
    ];

    const { error } = await supabaseClient
      .from('credit_scores')
      .insert({
        user_id: user.id,
        score: newScore,
        provider: 'Simulated Provider',
        score_date: new Date().toISOString(),
        change_from_previous: previousScore ? newScore - previousScore.score : 0,
        factors
      });

    if (error) throw error;

    // Check if score change meets alert threshold
    const { data: prefs } = await supabaseClient
      .from('notification_preferences')
      .select('credit_alerts, credit_score_alert_threshold')
      .eq('user_id', user.id)
      .maybeSingle();

    const threshold = prefs?.credit_score_alert_threshold || 10;
    const alertsEnabled = prefs?.credit_alerts ?? true;

    // Queue notification if significant change detected
    if (alertsEnabled && Math.abs(change) >= threshold) {
      const alertType = change > 0 ? 'credit_score_increase' : 'credit_score_decrease';
      const subject = change > 0 ? '📈 Your Credit Score Increased!' : '📉 Credit Score Alert';
      const message = `Your credit score ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} points`;

      // Determine milestone
      let milestone = null;
      if (newScore >= 800 && (previousScore?.score || 0) < 800) {
        milestone = "Exceptional Credit! 🌟";
      } else if (newScore >= 740 && (previousScore?.score || 0) < 740) {
        milestone = "Very Good Credit Range";
      } else if (newScore >= 670 && (previousScore?.score || 0) < 670) {
        milestone = "Good Credit Range";
      }

      await supabaseClient.from('notification_queue').insert({
        user_id: user.id,
        notification_type: alertType,
        subject,
        content: {
          previousScore: previousScore?.score,
          newScore,
          change,
          milestone,
          message,
          html_content: milestone 
            ? `${message}. You've reached: ${milestone}` 
            : message,
        },
        status: 'pending',
      });

      console.log(`Credit alert queued for user ${user.id}: ${alertType}`);
    }

    // Check if user achieved their credit goal
    const { data: currentGoal } = await supabaseClient
      .from('credit_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_achieved', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentGoal && newScore >= currentGoal.target_score) {
      // Mark goal as achieved
      await supabaseClient
        .from('credit_goals')
        .update({
          is_achieved: true,
          achieved_at: new Date().toISOString(),
        })
        .eq('id', currentGoal.id);

      // Send achievement notification
      await supabaseClient.from('notification_queue').insert({
        user_id: user.id,
        notification_type: 'credit_goal_achieved',
        subject: '🎯 Credit Goal Achieved!',
        content: {
          goalName: currentGoal.reason || 'Credit Score Goal',
          targetScore: currentGoal.target_score,
          currentScore: newScore,
          message: `Congratulations! You've reached your credit score goal of ${currentGoal.target_score}!`,
          html_content: `Congratulations! You've reached your credit score goal of ${currentGoal.target_score}!`,
        },
        status: 'pending',
      });

      console.log(`Credit goal achieved notification queued for user ${user.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Credit score updated',
        score: newScore,
        change: previousScore ? newScore - previousScore.score : 0,
        previous_score: previousScore?.score || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Credit Score Sync Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
