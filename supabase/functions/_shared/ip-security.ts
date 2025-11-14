/**
 * IP security utilities for edge functions
 * Handles IP blocking and security checks
 */

type SupabaseClient = any;

/**
 * Extracts IP address from request headers
 */
export function getClientIP(req: Request): string | null {
  // Check common headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ];

  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }

  return null;
}

/**
 * Checks if an IP is blocked and returns block information
 */
export async function checkIPBlock(
  supabase: SupabaseClient,
  ipAddress: string | null
): Promise<{ blocked: boolean; reason?: string; expires_at?: string }> {
  if (!ipAddress) {
    return { blocked: false };
  }

  try {
    const { data: block } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();

    if (block) {
      return {
        blocked: true,
        reason: block.reason,
        expires_at: block.expires_at,
      };
    }

    return { blocked: false };
  } catch (error) {
    console.error('[IP_SECURITY] Error checking IP block:', error);
    // Don't block on error
    return { blocked: false };
  }
}

/**
 * Tracks suspicious activity and auto-blocks IPs if threshold exceeded
 */
export async function trackSuspiciousActivity(
  supabase: SupabaseClient,
  ipAddress: string | null,
  activityType: 'validation_failure' | 'rate_limit' | 'auth_failure'
): Promise<void> {
  if (!ipAddress) return;

  try {
    // Check recent failures from this IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from('security_validation_failures')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo);

    // Get threshold
    const { data: config } = await supabase
      .from('security_alert_configs')
      .select('threshold')
      .eq('alert_type', 'blocked_ip_threshold')
      .maybeSingle();

    const threshold = config?.threshold || 10;

    // Auto-block if threshold exceeded
    if (count && count >= threshold) {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ipAddress,
          reason: `excessive_${activityType}`,
          block_type: 'temporary',
          expires_at: expiresAt,
          failure_count: count,
          last_failure_at: new Date().toISOString(),
          metadata: { auto_blocked: true, threshold },
        });

      console.log(`[IP_SECURITY] Auto-blocked IP ${ipAddress} (${count} failures)`);

      // Trigger alert via background task (fire and forget)
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-security-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert_type: 'blocked_ip_threshold',
          severity: 'high',
          title: 'IP Automatically Blocked',
          message: `IP ${ipAddress} auto-blocked after ${count} ${activityType} events in 1 hour.`,
          metadata: { ip_address: ipAddress, failure_count: count, threshold },
        }),
      }).catch(err => console.error('[IP_SECURITY] Failed to send alert:', err));
    }
  } catch (error) {
    console.error('[IP_SECURITY] Error tracking activity:', error);
  }
}
