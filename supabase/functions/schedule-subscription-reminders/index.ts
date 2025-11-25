import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get subscriptions with reminders enabled
    const { data: subscriptions, error: subError } = await supabase
      .from('card_subscriptions')
      .select('*')
      .eq('cancel_reminder_enabled', true)
      .eq('status', 'active')
      .not('next_expected_date', 'is', null);

    if (subError) throw subError;

    let remindersCreated = 0;

    for (const sub of subscriptions) {
      const nextDate = new Date(sub.next_expected_date);
      const reminderDate = new Date(nextDate);
      reminderDate.setDate(reminderDate.getDate() - sub.cancel_reminder_days_before);

      // Only create reminder if it's within the next 30 days
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (reminderDate > now && reminderDate < thirtyDaysFromNow) {
        // Check if reminder already exists
        const { data: existing } = await supabase
          .from('subscription_reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('reminder_date', reminderDate.toISOString().split('T')[0])
          .single();

        if (!existing) {
          const message = `${sub.ai_merchant_name || sub.merchant_name} subscription of $${(sub.amount_cents / 100).toFixed(2)} charges in ${sub.cancel_reminder_days_before} days`;

          // Create reminder entry
          const { error: reminderError } = await supabase
            .from('subscription_reminders')
            .insert({
              subscription_id: sub.id,
              user_id: sub.user_id,
              reminder_date: reminderDate.toISOString().split('T')[0],
              reminder_type: 'cancel',
              message
            });

          if (!reminderError) {
            // Create agent nudge for in-app notification
            await supabase
              .from('agent_nudges')
              .insert({
                user_id: sub.user_id,
                agent_type: 'subscription_manager',
                nudge_type: 'subscription_reminder',
                message,
                priority: 2,
                action_url: '/card?tab=subscriptions',
                expires_at: new Date(nextDate).toISOString()
              });

            remindersCreated++;
          }
        }
      }
    }

    console.log(`Created ${remindersCreated} new subscription reminders`);

    return new Response(JSON.stringify({
      success: true,
      remindersCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in schedule-subscription-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});