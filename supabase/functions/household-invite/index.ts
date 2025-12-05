import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HouseholdInviteRequest {
  householdId: string;
  email: string;
  role: "admin" | "member";
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

    // Get the authorization header to identify the inviter
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: inviter }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !inviter) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { householdId, email, role }: HouseholdInviteRequest = await req.json();

    if (!householdId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get household details
    const { data: household, error: householdError } = await supabase
      .from("households")
      .select("name, created_by")
      .eq("id", householdId)
      .single();

    if (householdError || !household) {
      return new Response(
        JSON.stringify({ error: "Household not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if inviter has permission to invite
    const { data: inviterMembership } = await supabase
      .from("household_members")
      .select("role")
      .eq("household_id", householdId)
      .eq("user_id", inviter.id)
      .single();

    const canInvite =
      household.created_by === inviter.id ||
      inviterMembership?.role === "owner" ||
      inviterMembership?.role === "admin";

    if (!canInvite) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to invite members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", inviter.id)
      .single();

    const inviterName = inviterProfile?.full_name || inviter.email || "Someone";

    // Check if user exists with this email
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email.toLowerCase());

    const existingUser = existingUsers?.[0];

    // Check if already a member
    if (existingUser) {
      const { data: existingMember } = await supabase
        .from("household_members")
        .select("id, status")
        .eq("household_id", householdId)
        .eq("user_id", existingUser.id)
        .single();

      if (existingMember) {
        if (existingMember.status === "accepted") {
          return new Response(
            JSON.stringify({ error: "This user is already a member" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else if (existingMember.status === "pending") {
          return new Response(
            JSON.stringify({ error: "An invitation is already pending for this user" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Create membership record
    const { data: membership, error: membershipError } = await supabase
      .from("household_members")
      .insert({
        household_id: householdId,
        user_id: existingUser?.id || inviter.id, // Temporary placeholder if user doesn't exist
        role: role || "member",
        status: "pending",
        invited_by: inviter.id,
        invite_email: email.toLowerCase(),
      })
      .select()
      .single();

    if (membershipError) {
      console.error("Failed to create membership:", membershipError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create in-app notification if user exists
    if (existingUser) {
      await supabase.from("wallet_notifications").insert({
        user_id: existingUser.id,
        type: "household_invite",
        title: `${inviterName} invited you`,
        message: `You've been invited to join "${household.name}"`,
        metadata: {
          household_id: householdId,
          household_name: household.name,
          inviter_id: inviter.id,
          membership_id: membership.id,
        },
        read: false,
      });
    }

    // Send email notification if Resend is configured
    if (resendApiKey) {
      try {
        const appUrl = "https://da72ae18-7876-494a-9046-a7e7bcb7663c.lovableproject.com";
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "$ave+ <notifications@resend.dev>",
            to: email,
            subject: `${inviterName} invited you to join "${household.name}" on $ave+`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0a0a0a; margin-bottom: 16px;">
                  You've been invited to a household!
                </h2>
                <p style="color: #555; margin-bottom: 16px;">
                  <strong>${inviterName}</strong> has invited you to join 
                  <strong>"${household.name}"</strong> on $ave+.
                </p>
                <p style="color: #555; margin-bottom: 24px;">
                  Join the household to collaborate on shared budgets and track expenses together.
                </p>
                <a href="${appUrl}" 
                   style="display: inline-block; background: #0a0a0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  ${existingUser ? "View Invitation" : "Sign Up to Accept"}
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 24px;">
                  If you didn't expect this invitation, you can safely ignore this email.
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

    // Log the action
    await supabase.from("security_audit_log").insert({
      user_id: inviter.id,
      event_type: "household_invite_sent",
      severity: "info",
      details: {
        household_id: householdId,
        invited_email: email,
        role: role,
        user_exists: !!existingUser,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: existingUser
          ? "Invitation sent successfully"
          : "Invitation email sent. They'll need to sign up to accept.",
        membership_id: membership.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in household-invite:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
