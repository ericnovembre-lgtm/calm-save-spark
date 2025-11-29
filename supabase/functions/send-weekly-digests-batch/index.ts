import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#10B981",
  Dining: "#F97316",
  Transportation: "#3B82F6",
  Entertainment: "#8B5CF6",
  Utilities: "#EAB308",
  Shopping: "#EC4899",
  Healthcare: "#EF4444",
  Travel: "#06B6D4",
  Other: "#6B7280",
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

    console.log("Starting batch weekly digest send with analytics...");

    // Fetch all users with weekly digest enabled
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
      .eq("notification_preferences.digest_frequency", "weekly");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users with weekly digest enabled`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const profile of profiles || []) {
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Fetch this week's transactions (expenses only)
        const { data: thisWeekTransactions } = await supabase
          .from("transactions")
          .select("amount, category, merchant, transaction_date")
          .eq("user_id", profile.id)
          .gte("transaction_date", weekAgo.toISOString().split("T")[0])
          .lt("amount", 0);

        // Fetch last week's transactions for comparison
        const { data: lastWeekTransactions } = await supabase
          .from("transactions")
          .select("amount, category")
          .eq("user_id", profile.id)
          .gte("transaction_date", twoWeeksAgo.toISOString().split("T")[0])
          .lt("transaction_date", weekAgo.toISOString().split("T")[0])
          .lt("amount", 0);

        // Fetch savings data
        const { data: transfers } = await supabase
          .from("transfer_history")
          .select("*")
          .eq("user_id", profile.id)
          .gte("created_at", weekAgo.toISOString());

        const { data: goals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", profile.id);

        // Fetch budgets for budget status
        const { data: budgets } = await supabase
          .from("user_budgets")
          .select("*")
          .eq("user_id", profile.id)
          .eq("is_active", true);

        // Calculate spending analytics
        const totalSpentThisWeek = thisWeekTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const totalSpentLastWeek = lastWeekTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const spendingChange = totalSpentLastWeek > 0 
          ? Math.round(((totalSpentThisWeek - totalSpentLastWeek) / totalSpentLastWeek) * 100) 
          : 0;

        // Group spending by category
        const categoryMap = new Map<string, number>();
        thisWeekTransactions?.forEach(t => {
          const cat = t.category || "Other";
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
        });

        const categories: SpendingCategory[] = Array.from(categoryMap.entries())
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalSpentThisWeek > 0 ? Math.round((amount / totalSpentThisWeek) * 100) : 0,
            color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Calculate savings
        const totalSavedThisWeek = transfers?.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;

        // Generate AI insights
        const insights: string[] = [];
        
        // Spending trend insight
        if (spendingChange > 20) {
          insights.push(`⚠️ Your spending is up ${spendingChange}% compared to last week`);
        } else if (spendingChange < -10) {
          insights.push(`🎉 Great job! You spent ${Math.abs(spendingChange)}% less than last week`);
        }

        // Top category insight
        if (categories.length > 0) {
          const topCat = categories[0];
          if (topCat.percentage > 40) {
            insights.push(`📊 ${topCat.category} made up ${topCat.percentage}% of your spending`);
          }
        }

        // Savings insight
        if (totalSavedThisWeek > 0) {
          insights.push(`💰 You saved $${totalSavedThisWeek.toFixed(2)} this week!`);
        } else {
          insights.push(`💡 Tip: Set up automatic savings to build your nest egg`);
        }

        // Budget status
        const monthlyBudget = budgets?.reduce((sum, b) => sum + parseFloat(String(b.amount)), 0) || 0;
        const budgetUsedPercent = monthlyBudget > 0 ? Math.round((totalSpentThisWeek * 4 / monthlyBudget) * 100) : 0;

        // Generate category bars HTML
        const categoryBarsHtml = categories.map(cat => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 14px;">${cat.category}</span>
              <span style="font-size: 14px; font-weight: 600;">$${cat.amount.toFixed(2)}</span>
            </div>
            <div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: ${cat.color}; height: 100%; width: ${cat.percentage}%; border-radius: 4px;"></div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #6b7280; margin-top: 2px;">${cat.percentage}%</div>
          </div>
        `).join('');

        // Generate insights HTML
        const insightsHtml = insights.map(insight => `
          <div style="background: #f3f4f6; border-left: 3px solid #667eea; padding: 12px 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
            ${insight}
          </div>
        `).join('');

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
                  background: #f9fafb;
                }
                .container {
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 32px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0 0 8px 0;
                  font-size: 24px;
                }
                .header p {
                  margin: 0;
                  opacity: 0.9;
                }
                .content {
                  padding: 24px;
                }
                .stats-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                  margin-bottom: 24px;
                }
                .stat-card {
                  background: #f9fafb;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                }
                .stat-label {
                  color: #6b7280;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 8px;
                }
                .stat-value {
                  font-size: 28px;
                  font-weight: bold;
                  color: #111;
                }
                .stat-change {
                  font-size: 12px;
                  margin-top: 4px;
                }
                .stat-change.up { color: #ef4444; }
                .stat-change.down { color: #10b981; }
                .section-title {
                  font-size: 16px;
                  font-weight: 600;
                  margin: 24px 0 16px 0;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .budget-bar {
                  background: #e5e7eb;
                  border-radius: 8px;
                  height: 12px;
                  overflow: hidden;
                  margin-bottom: 8px;
                }
                .budget-fill {
                  background: linear-gradient(90deg, #667eea, #764ba2);
                  height: 100%;
                  border-radius: 8px;
                }
                .footer {
                  text-align: center;
                  padding: 24px;
                  color: #9ca3af;
                  font-size: 12px;
                  border-top: 1px solid #e5e7eb;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📊 Your Weekly Analytics Digest</h1>
                  <p>Hi ${profile.full_name || 'there'}! Here's your spending summary for the past week.</p>
                </div>

                <div class="content">
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-label">Total Spent</div>
                      <div class="stat-value">$${totalSpentThisWeek.toFixed(2)}</div>
                      ${spendingChange !== 0 ? `
                        <div class="stat-change ${spendingChange > 0 ? 'up' : 'down'}">
                          ${spendingChange > 0 ? '↑' : '↓'} ${Math.abs(spendingChange)}% vs last week
                        </div>
                      ` : ''}
                    </div>
                    <div class="stat-card">
                      <div class="stat-label">Transactions</div>
                      <div class="stat-value">${thisWeekTransactions?.length || 0}</div>
                    </div>
                  </div>

                  ${categories.length > 0 ? `
                    <div class="section-title">🍕 Top Spending Categories</div>
                    ${categoryBarsHtml}
                  ` : ''}

                  ${insights.length > 0 ? `
                    <div class="section-title">💡 AI Insights</div>
                    ${insightsHtml}
                  ` : ''}

                  ${monthlyBudget > 0 ? `
                    <div class="section-title">📈 Monthly Budget Status</div>
                    <div class="budget-bar">
                      <div class="budget-fill" style="width: ${Math.min(budgetUsedPercent, 100)}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px; color: #6b7280;">
                      <span>$${(totalSpentThisWeek * 4).toFixed(0)} projected / $${monthlyBudget.toFixed(0)} budget</span>
                      <span>${budgetUsedPercent}% used</span>
                    </div>
                  ` : ''}

                  ${goals && goals.length > 0 ? `
                    <div class="section-title">🎯 Active Goals: ${goals.length}</div>
                  ` : ''}
                </div>

                <div class="footer">
                  You're receiving this because you're a $ave+ user.<br>
                  Update your preferences in Settings to change frequency.
                </div>
              </div>
            </body>
          </html>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "$ave+ <noreply@resend.dev>",
          to: [profile.email],
          subject: `📊 Weekly Digest: You spent $${totalSpentThisWeek.toFixed(2)} this week`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          results.failed++;
          results.errors.push(`${profile.email}: ${emailError.message}`);
        } else {
          console.log(`Successfully sent analytics digest to ${profile.email}`);
          results.sent++;
        }
      } catch (error) {
        console.error(`Error processing digest for ${profile.email}:`, error);
        results.failed++;
        results.errors.push(`${profile.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log("Batch analytics digest send complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly analytics digests processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
