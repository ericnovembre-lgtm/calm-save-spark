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

    const { userId } = await req.json();

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (!profile) {
      throw new Error("User not found");
    }

    // Fetch week's activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: transfers } = await supabase
      .from("transfer_history")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", weekAgo.toISOString());

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    const { data: scheduledTransfers } = await supabase
      .from("scheduled_transfers")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("next_transfer_date", new Date().toISOString())
      .lte("next_transfer_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate stats
    const totalSavedThisWeek = transfers?.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
    const goalsNearCompletion = goals?.filter(g => {
      const progress = (parseFloat(String(g.current_amount)) / parseFloat(String(g.target_amount))) * 100;
      return progress >= 80 && progress < 100;
    }) || [];

    // Generate recommendations based on activity
    const recommendations = [];
    if (totalSavedThisWeek === 0) {
      recommendations.push("You haven't made any transfers this week. Consider setting up automated savings!");
    }
    if (goalsNearCompletion.length > 0) {
      recommendations.push(`You're almost there! ${goalsNearCompletion.length} goal${goalsNearCompletion.length > 1 ? 's are' : ' is'} within 20% of completion.`);
    }
    if (scheduledTransfers && scheduledTransfers.length > 0) {
      recommendations.push(`You have ${scheduledTransfers.length} scheduled transfer${scheduledTransfers.length > 1 ? 's' : ''} coming up this week.`);
    }

    // Create email HTML
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
            .stat-label {
              color: #666;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
            .recommendation {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 4px;
            }
            .upcoming-transfer {
              background: white;
              border: 1px solid #e0e0e0;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 4px;
            }
            .btn {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Weekly $ave+ Digest</h1>
            <p>Hi ${profile.full_name || 'there'}! Here's your savings summary for the past week.</p>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Saved This Week</div>
            <div class="stat-value">$${totalSavedThisWeek.toFixed(2)}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Active Goals</div>
            <div class="stat-value">${goals?.length || 0}</div>
          </div>

          <h2 style="margin-top: 30px;">📊 Smart Recommendations</h2>
          ${recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}

          ${scheduledTransfers && scheduledTransfers.length > 0 ? `
            <h2 style="margin-top: 30px;">📅 Upcoming Transfers</h2>
            ${scheduledTransfers.map(st => `
              <div class="upcoming-transfer">
                <strong>$${parseFloat(String(st.amount)).toFixed(2)}</strong> - ${new Date(st.next_transfer_date).toLocaleDateString()}
              </div>
            `).join('')}
          ` : ''}

          ${goalsNearCompletion.length > 0 ? `
            <h2 style="margin-top: 30px;">🎯 Goals Near Completion</h2>
            ${goalsNearCompletion.map(goal => {
              const progress = ((parseFloat(String(goal.current_amount)) / parseFloat(String(goal.target_amount))) * 100).toFixed(0);
              return `
                <div class="upcoming-transfer">
                  <strong>${goal.name}</strong> - ${progress}% complete
                </div>
              `;
            }).join('')}
          ` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="${supabaseUrl.replace('https://gmnpjgelzsmcidwrwbcg.supabase.co', 'https://your-app-url.com')}/dashboard" class="btn">
              View Dashboard
            </a>
          </div>

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
            You're receiving this email because you're a $ave+ user. 
            <br>To unsubscribe, update your notification preferences in settings.
          </p>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "$ave+ <noreply@resend.dev>",
      to: [profile.email],
      subject: `Your Weekly $ave+ Digest - You saved $${totalSavedThisWeek.toFixed(2)} this week!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Digest sent successfully" }),
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
