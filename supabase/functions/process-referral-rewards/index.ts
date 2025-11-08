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

    console.log('Processing referral rewards...');

    // Find completed referrals that haven't been rewarded
    const { data: pendingReferrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('status', 'completed')
      .is('rewarded_at', null);

    if (!pendingReferrals || pendingReferrals.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No referrals to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const referral of pendingReferrals) {
      const rewardPoints = 500; // Base referral reward
      const rewardAmount = 10; // $10 bonus

      // Award achievement to referrer
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('achievement_type', 'referral_bonus')
        .single();

      if (achievement) {
        await supabase.from('user_achievements').insert({
          user_id: referral.referrer_user_id,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString(),
          points_earned: rewardPoints
        } as any);
      }

      // Update referral status
      await supabase
        .from('referrals')
        .update({
          status: 'rewarded',
          reward_points: rewardPoints,
          reward_amount: rewardAmount,
          rewarded_at: new Date().toISOString()
        } as any)
        .eq('id', referral.id);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Referral rewards processed successfully',
        count: pendingReferrals.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing referral rewards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});