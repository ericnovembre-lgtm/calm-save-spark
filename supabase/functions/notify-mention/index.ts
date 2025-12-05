import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MentionNotificationRequest {
  commentId: string;
  budgetId: string;
  mentionedUserIds: string[];
  commentText: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the commenter
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: commenter }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !commenter) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { commentId, budgetId, mentionedUserIds, commentText }: MentionNotificationRequest = 
      await req.json();

    if (!mentionedUserIds || mentionedUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No mentions to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get budget details
    const { data: budget } = await supabase
      .from("user_budgets")
      .select("name")
      .eq("id", budgetId)
      .single();

    // Get commenter profile
    const { data: commenterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", commenter.id)
      .single();

    const commenterName = commenterProfile?.full_name || commenter.email || "Someone";
    const budgetName = budget?.name || "a budget";

    // Get mentioned users' profiles and notification preferences
    const { data: mentionedUsers } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", mentionedUserIds);

    if (!mentionedUsers || mentionedUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No valid users to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create in-app notifications for each mentioned user
    const notifications = mentionedUserIds.map((userId) => ({
      user_id: userId,
      type: "mention",
      title: `${commenterName} mentioned you`,
      message: `You were mentioned in a comment on "${budgetName}"`,
      metadata: {
        comment_id: commentId,
        budget_id: budgetId,
        commenter_id: commenter.id,
        preview: commentText.slice(0, 100),
      },
      read: false,
    }));

    // Insert in-app notifications
    const { error: notifError } = await supabase
      .from("wallet_notifications")
      .insert(notifications);

    if (notifError) {
      console.error("Failed to create notifications:", notifError);
    }

    // Send email notifications if Resend is configured
    if (resendApiKey) {
      for (const mentionedUser of mentionedUsers) {
        // Check user's notification preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("email_enabled")
          .eq("user_id", mentionedUser.user_id)
          .single();

        // Skip if user has disabled email notifications
        if (prefs && !prefs.email_enabled) {
          continue;
        }

        const userEmail = mentionedUser.email;
        if (!userEmail) continue;

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "$ave+ <notifications@saveplus.app>",
              to: userEmail,
              subject: `${commenterName} mentioned you in ${budgetName}`,
              html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #0a0a0a;">You were mentioned in a comment</h2>
                  <p style="color: #666;">
                    <strong>${commenterName}</strong> mentioned you in a comment on 
                    <strong>"${budgetName}"</strong>:
                  </p>
                  <blockquote style="border-left: 3px solid #d6c8a2; padding-left: 16px; margin: 16px 0; color: #444;">
                    ${commentText.slice(0, 200)}${commentText.length > 200 ? "..." : ""}
                  </blockquote>
                  <a href="${Deno.env.get("SITE_URL") || "https://saveplus.app"}/budgets/${budgetId}" 
                     style="display: inline-block; background: #0a0a0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                    View Comment
                  </a>
                  <p style="color: #999; font-size: 12px; margin-top: 32px;">
                    You can manage your notification preferences in the $ave+ app settings.
                  </p>
                </div>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error("Failed to send email:", await emailResponse.text());
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }
    }

    // Log the notification event
    await supabase.from("security_audit_log").insert({
      user_id: commenter.id,
      event_type: "mention_notification_sent",
      severity: "info",
      details: {
        comment_id: commentId,
        budget_id: budgetId,
        mentioned_count: mentionedUserIds.length,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: mentionedUserIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-mention:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
