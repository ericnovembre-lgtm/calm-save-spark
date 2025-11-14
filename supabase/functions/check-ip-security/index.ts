import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IPCheckResult {
  blocked: boolean;
  reason?: string;
  expires_at?: string;
  should_block?: boolean;
  failure_count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { ip_address, event_type } = await req.json();

    if (!ip_address) {
      return new Response(
        JSON.stringify({ error: 'IP address required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if IP is already blocked
    const { data: existingBlock } = await supabaseClient
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ip_address)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();

    if (existingBlock) {
      console.log(`[IP_CHECK] IP ${ip_address} is blocked: ${existingBlock.reason}`);
      return new Response(
        JSON.stringify({
          blocked: true,
          reason: existingBlock.reason,
          expires_at: existingBlock.expires_at,
        } as IPCheckResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track this event
    if (event_type === 'validation_failure' || event_type === 'rate_limit') {
      // Check failure count in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count: recentFailures } = await supabaseClient
        .from('security_validation_failures')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip_address)
        .gte('created_at', oneHourAgo);

      // Get threshold from config
      const { data: config } = await supabaseClient
        .from('security_alert_configs')
        .select('threshold')
        .eq('alert_type', 'blocked_ip_threshold')
        .single();

      const threshold = config?.threshold || 10;

      if (recentFailures && recentFailures >= threshold) {
        // Block the IP temporarily (24 hours)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { error: blockError } = await supabaseClient
          .from('blocked_ips')
          .insert({
            ip_address,
            reason: 'excessive_validation_failures',
            block_type: 'temporary',
            expires_at: expiresAt,
            failure_count: recentFailures,
            last_failure_at: new Date().toISOString(),
            metadata: {
              threshold,
              triggered_by: event_type,
            },
          });

        if (blockError) {
          console.error('[IP_CHECK] Error blocking IP:', blockError);
        } else {
          console.log(`[IP_CHECK] Blocked IP ${ip_address} with ${recentFailures} failures`);

          // Trigger security alert
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-security-alert`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              alert_type: 'blocked_ip_threshold',
              severity: 'high',
              title: 'IP Automatically Blocked',
              message: `IP address ${ip_address} has been automatically blocked due to ${recentFailures} validation failures in the past hour.`,
              metadata: {
                ip_address,
                failure_count: recentFailures,
                block_duration: '24 hours',
                threshold,
              },
            }),
          });
        }

        return new Response(
          JSON.stringify({
            blocked: true,
            reason: 'excessive_validation_failures',
            expires_at: expiresAt,
            failure_count: recentFailures,
          } as IPCheckResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if approaching threshold
      const warningThreshold = Math.floor(threshold * 0.7);
      if (recentFailures && recentFailures >= warningThreshold) {
        console.warn(`[IP_CHECK] IP ${ip_address} approaching block threshold: ${recentFailures}/${threshold}`);
        return new Response(
          JSON.stringify({
            blocked: false,
            should_block: false,
            failure_count: recentFailures,
            warning: `Approaching block threshold (${recentFailures}/${threshold})`,
          } as IPCheckResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        blocked: false,
        failure_count: 0,
      } as IPCheckResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[IP_CHECK] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
