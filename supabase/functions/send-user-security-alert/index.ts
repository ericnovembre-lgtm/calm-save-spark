import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  user_id: string;
  event_type: string;
  event_message: string;
  severity: "info" | "success" | "warning" | "critical";
  metadata?: Record<string, unknown>;
}

interface NotificationPreferences {
  email_notifications: boolean;
  security_login_alerts?: boolean;
  security_session_revoked?: boolean;
  security_lockdown_alerts?: boolean;
  security_suspicious_activity?: boolean;
  [key: string]: boolean | undefined;
}

// Map event types to notification preference columns
const eventTypeToPreference: Record<string, string> = {
  login: "security_login_alerts",
  logout: "security_login_alerts",
  session_revoked: "security_session_revoked",
  lockdown_activated: "security_lockdown_alerts",
  lockdown_deactivated: "security_lockdown_alerts",
  suspicious_activity: "security_suspicious_activity",
  device_authorized: "security_login_alerts",
  connection_severed: "security_session_revoked",
  password_change: "security_login_alerts",
  mfa_enabled: "security_login_alerts",
  mfa_disabled: "security_login_alerts",
};

// Severity colors for email styling
const severityColors = {
  info: { bg: "#1e40af", text: "#3b82f6", border: "#2563eb" },
  success: { bg: "#166534", text: "#22c55e", border: "#16a34a" },
  warning: { bg: "#a16207", text: "#eab308", border: "#ca8a04" },
  critical: { bg: "#991b1b", text: "#ef4444", border: "#dc2626" },
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-user-security-alert] Request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, event_type, event_message, severity, metadata }: SecurityAlertRequest = await req.json();

    console.log(`[send-user-security-alert] Processing alert for user ${user_id}, event: ${event_type}, severity: ${severity}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's notification preferences
    const preferenceColumn = eventTypeToPreference[event_type] || "security_suspicious_activity";
    
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (prefError && prefError.code !== "PGRST116") {
      console.error("[send-user-security-alert] Error fetching preferences:", prefError);
    }

    const prefs = preferences as NotificationPreferences | null;
    
    // Check if user wants these alerts (default to true if no preferences set)
    const emailEnabled = prefs?.email_notifications ?? true;
    const securityAlertEnabled = prefs?.[preferenceColumn] ?? true;

    if (!emailEnabled || !securityAlertEnabled) {
      console.log(`[send-user-security-alert] Alerts disabled for user ${user_id}, skipping email`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "alerts_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user's email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user_id)
      .single();

    if (profileError || !profile?.email) {
      console.error("[send-user-security-alert] Error fetching profile or no email:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "User email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const colors = severityColors[severity];
    const userName = profile.full_name || "there";
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Build metadata details for email
    let metadataHtml = "";
    if (metadata) {
      const metadataEntries = Object.entries(metadata)
        .filter(([key]) => !["user_id", "timestamp"].includes(key))
        .map(([key, value]) => {
          const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          return `<tr><td style="padding: 8px 12px; color: #9ca3af; font-size: 13px;">${formattedKey}</td><td style="padding: 8px 12px; color: #e5e7eb; font-family: monospace; font-size: 13px;">${value}</td></tr>`;
        });
      if (metadataEntries.length > 0) {
        metadataHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background: #1f2937; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #111827;">
                <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase;">Detail</th>
                <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase;">Value</th>
              </tr>
            </thead>
            <tbody>${metadataEntries.join("")}</tbody>
          </table>
        `;
      }
    }

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${colors.bg} 0%, #0f172a 100%); padding: 32px 40px; border-bottom: 2px solid ${colors.border};">
                      <table width="100%">
                        <tr>
                          <td>
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                              🛡️ Security Alert
                            </h1>
                            <p style="margin: 8px 0 0; color: ${colors.text}; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                              ${severity.toUpperCase()} • ${event_type.replace(/_/g, " ").toUpperCase()}
                            </p>
                          </td>
                          <td align="right">
                            <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 50%; width: 48px; height: 48px; display: inline-block; text-align: center; line-height: 44px; font-size: 24px;">
                              ${severity === "critical" ? "🚨" : severity === "warning" ? "⚠️" : severity === "success" ? "✅" : "ℹ️"}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                        Hi ${userName},
                      </p>
                      <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                        ${event_message}
                      </p>
                      
                      <div style="background: #0f172a; border-radius: 8px; padding: 16px; border-left: 4px solid ${colors.border};">
                        <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                          <strong style="color: #e2e8f0;">Time:</strong> ${timestamp}
                        </p>
                      </div>
                      
                      ${metadataHtml}
                      
                      ${severity === "critical" || severity === "warning" ? `
                        <div style="margin-top: 24px; padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
                          <p style="margin: 0; color: #fca5a5; font-size: 14px;">
                            <strong>⚠️ If you didn't perform this action</strong>, please secure your account immediately by changing your password and reviewing your active sessions.
                          </p>
                        </div>
                      ` : ""}
                      
                      <table width="100%" style="margin-top: 32px;">
                        <tr>
                          <td>
                            <a href="https://saveplus.app/guardian" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                              Review Security Settings →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #0f172a; padding: 24px 40px; border-top: 1px solid #334155;">
                      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                        You received this email because you have security alerts enabled for your $ave+ account.
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 12px;">
                        <a href="https://saveplus.app/security-settings" style="color: #3b82f6; text-decoration: none;">Manage notification preferences</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "$ave+ Security <security@resend.dev>",
      to: [profile.email],
      subject: `🛡️ Security Alert: ${event_message.substring(0, 50)}${event_message.length > 50 ? "..." : ""}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("[send-user-security-alert] Email send error:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: (emailError as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[send-user-security-alert] Email sent successfully to ${profile.email}`);

    return new Response(
      JSON.stringify({ success: true, email_sent: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("[send-user-security-alert] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
