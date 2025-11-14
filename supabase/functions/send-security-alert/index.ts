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
      from: "$ave+ Security <onboarding@resend.dev>",
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

interface SecurityAlert {
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
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

    const alert: SecurityAlert = await req.json();

    // Get admin emails from config
    const { data: config } = await supabaseClient
      .from('security_alert_configs')
      .select('admin_emails')
      .eq('alert_type', alert.alert_type)
      .single();

    if (!config || !config.admin_emails || config.admin_emails.length === 0) {
      console.log('[SECURITY_ALERT] No admin emails configured for', alert.alert_type);
      return new Response(
        JSON.stringify({ success: false, message: 'No admin emails configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store alert in database
    const { data: alertRecord, error: alertError } = await supabaseClient
      .from('security_alerts')
      .insert({
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        metadata: alert.metadata || {},
      })
      .select()
      .single();

    if (alertError) {
      console.error('[SECURITY_ALERT] Error storing alert:', alertError);
    }

    // Determine email styling
    const severityColors: Record<string, string> = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };

    const severityBadges: Record<string, string> = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };

    // Generate HTML
    const metadataHTML = alert.metadata && Object.keys(alert.metadata).length > 0 ? 
      `<div class="metadata">
        <h3 style="margin-top: 0; font-size: 14px; color: #6b7280;">Alert Details</h3>
        ${Object.entries(alert.metadata).map(([key, value]) => 
          `<div class="metadata-item">
            <span class="metadata-label">${key}:</span>
            <span class="metadata-value">${JSON.stringify(value)}</span>
          </div>`
        ).join('')}
      </div>` : '';

    const htmlReport = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .alert-badge { display: inline-block; background: ${severityColors[alert.severity]}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .metadata { background: white; padding: 15px; border-radius: 4px; margin-top: 15px; border-left: 4px solid ${severityColors[alert.severity]}; }
    .metadata-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .metadata-item:last-child { border-bottom: none; }
    .metadata-label { font-weight: 600; color: #6b7280; }
    .metadata-value { color: #111827; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .cta-button { display: inline-block; background: ${severityColors[alert.severity]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">${severityBadges[alert.severity]} Security Alert</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleString()}</p>
    </div>
    <div class="content">
      <div style="margin-bottom: 15px;">
        <span class="alert-badge">${alert.severity}</span>
      </div>
      <h2 style="margin-top: 0; color: #111827;">${alert.title}</h2>
      <p style="color: #374151; margin-bottom: 20px;">${alert.message}</p>
      ${metadataHTML}
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/security-monitoring" class="cta-button">
        View Security Dashboard
      </a>
    </div>
    <div class="footer">
      <p>This is an automated security alert from $ave+. Do not reply to this email.</p>
      <p>To manage alert settings, visit your admin dashboard.</p>
    </div>
  </div>
</body>
</html>`;

    // Send emails
    const emailPromises = config.admin_emails.map((email: string) =>
      sendEmail([email], `${severityBadges[alert.severity]} Security Alert: ${alert.title}`, htmlReport)
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`[SECURITY_ALERT] Sent ${successCount} emails, ${failedCount} failed`);

    // Update last triggered time
    await supabaseClient
      .from('security_alert_configs')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('alert_type', alert.alert_type);

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alertRecord?.id,
        emails_sent: successCount,
        emails_failed: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[SECURITY_ALERT] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
