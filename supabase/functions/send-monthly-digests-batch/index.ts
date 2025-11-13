import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    console.log("Starting monthly digest send...");

    // Fetch users with monthly digest frequency
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id, 
        email, 
        full_name,
        notification_preferences!inner(weekly_digest_enabled, digest_frequency)
      `)
      .not("email", "is", null)
      .eq("notification_preferences.weekly_digest_enabled", true)
      .eq("notification_preferences.digest_frequency", "monthly");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users with monthly digest enabled`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send digest to each user
    for (const profile of profiles || []) {
      try {
        // Fetch last month's activity
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const { data: transfers } = await supabase
          .from("transfer_history")
          .select("*")
          .eq("user_id", profile.id)
          .gte("created_at", lastMonth.toISOString());

        const { data: goals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", profile.id);

        const totalSaved = transfers?.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
        const goalsCompleted = goals?.filter(g => 
          parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))
        ).length || 0;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 8px;
                  text-align: center;
                  margin-bottom: 30px;
                }
                .stat-card {
                  background: #f7f7f7;
                  padding: 20px;
                  border-radius: 8px;
                  margin-bottom: 15px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Your Monthly $ave+ Report</h1>
                <p>Hi ${profile.full_name || 'there'}! Here's your monthly savings summary.</p>
              </div>

              <div class="stat-card">
                <div class="stat-label">Total Saved This Month</div>
                <div class="stat-value">$${totalSaved.toFixed(2)}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">Goals Completed</div>
                <div class="stat-value">${goalsCompleted}</div>
              </div>

              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
                You're receiving this monthly digest. Update frequency in settings.
              </p>
            </body>
          </html>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "$ave+ <noreply@resend.dev>",
          to: [profile.email],
          subject: `Monthly $ave+ Report - $${totalSaved.toFixed(2)} saved this month!`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          results.failed++;
          results.errors.push(`${profile.email}: ${emailError.message}`);
        } else {
          console.log(`Successfully sent digest to ${profile.email}`);
          results.sent++;
        }
      } catch (error) {
        console.error(`Error processing digest for ${profile.email}:`, error);
        results.failed++;
        results.errors.push(`${profile.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log("Monthly digest send complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Monthly digests processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
