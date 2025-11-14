import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Resend API helper
async function sendEmail(to: string[], subject: string, html: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "$ave+ Security <security@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all admin emails from any alert config
    const { data: configs } = await supabaseClient
      .from('security_alert_configs')
      .select('admin_emails')
      .limit(1);

    if (!configs || configs.length === 0 || !configs[0].admin_emails || configs[0].admin_emails.length === 0) {
      console.log('[WEEKLY_REPORT] No admin emails configured');
      return new Response(
        JSON.stringify({ success: false, message: 'No admin emails configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminEmails = configs[0].admin_emails;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Gather security metrics from the past week
    const [rateLimits, validationFailures, errorLogs, alerts, blockedIPs] = await Promise.all([
      supabaseClient
        .from('edge_function_rate_limits')
        .select('*')
        .gte('window_start', weekAgo),
      supabaseClient
        .from('security_validation_failures')
        .select('*')
        .gte('created_at', weekAgo),
      supabaseClient
        .from('security_error_logs')
        .select('*')
        .gte('last_seen_at', weekAgo),
      supabaseClient
        .from('security_alerts')
        .select('*')
        .gte('triggered_at', weekAgo),
      supabaseClient
        .from('blocked_ips')
        .select('*')
        .gte('blocked_at', weekAgo),
    ]);

    // Calculate metrics
    const metrics = {
      totalRateLimitHits: rateLimits.data?.length || 0,
      totalValidationFailures: validationFailures.data?.length || 0,
      totalErrors: errorLogs.data?.reduce((sum, log) => sum + log.request_count, 0) || 0,
      totalAlerts: alerts.data?.length || 0,
      newBlockedIPs: blockedIPs.data?.length || 0,
      criticalAlerts: alerts.data?.filter(a => a.severity === 'critical').length || 0,
      highAlerts: alerts.data?.filter(a => a.severity === 'high').length || 0,
    };

    // Top functions by rate limits
    const rateLimitsByFunction = rateLimits.data?.reduce((acc: Record<string, number>, limit) => {
      acc[limit.function_name] = (acc[limit.function_name] || 0) + limit.call_count;
      return acc;
    }, {});

    const topFunctions = Object.entries(rateLimitsByFunction || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Top validation failure types
    const failuresByType = validationFailures.data?.reduce((acc: Record<string, number>, failure) => {
      acc[failure.failure_type] = (acc[failure.failure_type] || 0) + 1;
      return acc;
    }, {});

    const topFailureTypes = Object.entries(failuresByType || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Generate HTML report
    const htmlReport = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 20px; }
            .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; }
            .header h1 { margin: 0 0 10px 0; font-size: 32px; }
            .header p { margin: 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
            .metric-card { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
            .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
            .metric-value { font-size: 32px; font-weight: bold; color: #111827; }
            .metric-change { font-size: 14px; color: #10b981; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
            .list-item { display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; margin-bottom: 8px; border-radius: 6px; }
            .list-item-label { font-weight: 500; color: #374151; }
            .list-item-value { font-weight: 600; color: #667eea; }
            .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .alert-critical { background: #fef2f2; color: #dc2626; }
            .alert-high { background: #fffbeb; color: #f59e0b; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
            .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ Weekly Security Report</h1>
              <p>Security summary for ${new Date(weekAgo).toLocaleDateString()} - ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="content">
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-label">Total Alerts</div>
                  <div class="metric-value">${metrics.totalAlerts}</div>
                  ${metrics.criticalAlerts > 0 ? `<div class="metric-change" style="color: #ef4444;">${metrics.criticalAlerts} Critical</div>` : ''}
                </div>
                
                <div class="metric-card">
                  <div class="metric-label">Rate Limit Hits</div>
                  <div class="metric-value">${metrics.totalRateLimitHits}</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-label">Validation Failures</div>
                  <div class="metric-value">${metrics.totalValidationFailures}</div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-label">Blocked IPs</div>
                  <div class="metric-value">${metrics.newBlockedIPs}</div>
                </div>
              </div>

              ${metrics.criticalAlerts > 0 || metrics.highAlerts > 0 ? `
                <div class="section">
                  <div class="section-title">⚠️ Critical Issues</div>
                  ${metrics.criticalAlerts > 0 ? `
                    <div style="padding: 15px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px; margin-bottom: 10px;">
                      <span class="alert-badge alert-critical">${metrics.criticalAlerts} Critical Alerts</span>
                      <p style="margin: 10px 0 0 0; color: #991b1b;">Immediate attention required. Review security dashboard immediately.</p>
                    </div>
                  ` : ''}
                  ${metrics.highAlerts > 0 ? `
                    <div style="padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px;">
                      <span class="alert-badge alert-high">${metrics.highAlerts} High Priority Alerts</span>
                      <p style="margin: 10px 0 0 0; color: #92400e;">Review and address these issues soon.</p>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${topFunctions.length > 0 ? `
                <div class="section">
                  <div class="section-title">📊 Top Functions by API Calls</div>
                  ${topFunctions.map(([name, calls]) => `
                    <div class="list-item">
                      <span class="list-item-label">${name}</span>
                      <span class="list-item-value">${calls} calls</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${topFailureTypes.length > 0 ? `
                <div class="section">
                  <div class="section-title">🚫 Top Validation Failure Types</div>
                  ${topFailureTypes.map(([type, count]) => `
                    <div class="list-item">
                      <span class="list-item-label">${type}</span>
                      <span class="list-item-value">${count} failures</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 40px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/security-monitoring" class="cta-button">
                  View Full Security Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>$ave+ Security</strong></p>
              <p>This is an automated weekly security report. To manage alert settings, visit your admin dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails to all admins
    const emailPromises = adminEmails.map((email: string) =>
      sendEmail(
        [email],
        `🛡️ Weekly Security Report - ${new Date().toLocaleDateString()}`,
        htmlReport
      )
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    console.log(`[WEEKLY_REPORT] Sent ${successCount} reports`);

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: successCount,
        report_period: { from: weekAgo, to: new Date().toISOString() },
        metrics,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[WEEKLY_REPORT] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
