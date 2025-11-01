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

    const alerts = [];
    
    // Check for upcoming subscription charges (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: upcomingSubs } = await supabaseClient
      .from('detected_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .lte('next_expected_date', sevenDaysFromNow.toISOString())
      .gte('next_expected_date', new Date().toISOString());

    for (const sub of upcomingSubs || []) {
      const daysUntil = Math.ceil(
        (new Date(sub.next_expected_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      alerts.push({
        user_id: user.id,
        alert_type: 'subscription_reminder',
        title: `Upcoming charge: ${sub.merchant}`,
        message: `Your ${sub.merchant} subscription of $${sub.amount} will be charged in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        severity: 'info',
      });
    }

    // Check for goal milestones
    const { data: goals } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    for (const goal of goals || []) {
      const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
      
      // Alert at 25%, 50%, 75%, 100% milestones
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (progress >= milestone && progress < milestone + 5) {
          alerts.push({
            user_id: user.id,
            alert_type: 'goal_milestone',
            title: `${milestone}% of goal reached! 🎉`,
            message: `You've saved $${goal.current_amount} toward your "${goal.name}" goal of $${goal.target_amount}`,
            severity: 'info',
            action_url: '/goals',
          });
        }
      }
    }

    // Check for unusual spending (transactions > 2x average)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTx } = await supabaseClient
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .gte('transaction_date', thirtyDaysAgo.toISOString());

    if (recentTx && recentTx.length > 0) {
      const amounts = recentTx.map(t => parseFloat(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      const { data: todayTx } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      for (const tx of todayTx || []) {
        if (parseFloat(tx.amount) > avgAmount * 2) {
          alerts.push({
            user_id: user.id,
            alert_type: 'unusual_spending',
            title: 'Unusual transaction detected',
            message: `You spent $${tx.amount} at ${tx.merchant || 'Unknown'}, which is higher than your usual spending`,
            severity: 'warning',
          });
        }
      }
    }

    // Insert alerts (avoid duplicates by checking recent alerts)
    for (const alert of alerts) {
      const { data: existing } = await supabaseClient
        .from('user_alerts')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', alert.title)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (!existing) {
        await supabaseClient.from('user_alerts').insert(alert);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_created: alerts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
