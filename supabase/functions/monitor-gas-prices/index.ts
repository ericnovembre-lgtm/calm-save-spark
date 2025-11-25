import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Monitor gas prices and send notifications when they drop below user thresholds
 * Should be triggered via cron/scheduled job (every 5-10 minutes)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current gas prices for supported chains
    const gasPrices = await fetchGasPrices();
    
    // Get all active gas alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('wallet_gas_alerts')
      .select('*')
      .eq('is_active', true);

    if (alertsError) throw alertsError;
    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ message: 'No active alerts' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifications = [];
    const now = new Date();

    for (const alert of alerts) {
      const currentGas = gasPrices[alert.chain_id];
      
      if (!currentGas) continue;

      // Check if gas price is below threshold
      if (currentGas <= alert.threshold_gwei) {
        // Check if we haven't notified in the last hour
        const lastTriggered = alert.last_triggered_at ? new Date(alert.last_triggered_at) : null;
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        if (!lastTriggered || lastTriggered < oneHourAgo) {
          // Create notification
          const { error: notifError } = await supabase
            .from('wallet_notifications')
            .insert({
              user_id: alert.user_id,
              notification_type: 'gas_alert',
              title: `⛽ Gas Alert: ${alert.chain_id}`,
              message: `Gas prices dropped to ${currentGas} gwei (below your ${alert.threshold_gwei} gwei threshold)`,
              priority: 'medium',
              metadata: {
                chain_id: alert.chain_id,
                current_gas: currentGas,
                threshold: alert.threshold_gwei,
              },
            });

          if (notifError) {
            console.error('Error creating notification:', notifError);
            continue;
          }

          // Update last triggered timestamp
          await supabase
            .from('wallet_gas_alerts')
            .update({ last_triggered_at: now.toISOString() })
            .eq('id', alert.id);

          notifications.push({
            user_id: alert.user_id,
            chain: alert.chain_id,
            gas: currentGas,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        gasPrices,
        notificationsSent: notifications.length,
        notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error monitoring gas prices:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Fetch current gas prices for supported chains
 * In production, this would call real APIs like Etherscan, Polygonscan, etc.
 */
async function fetchGasPrices(): Promise<Record<string, number>> {
  // Mock data for demo - in production, fetch from chain APIs
  return {
    ethereum: Math.floor(Math.random() * 50 + 20), // 20-70 gwei
    polygon: Math.floor(Math.random() * 100 + 50), // 50-150 gwei
    arbitrum: Math.floor(Math.random() * 10 + 5),  // 5-15 gwei
    optimism: Math.floor(Math.random() * 10 + 5),  // 5-15 gwei
    base: Math.floor(Math.random() * 5 + 2),       // 2-7 gwei
  };
}
