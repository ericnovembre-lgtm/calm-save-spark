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

    console.log("Starting monthly analytics digest send...");

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

    for (const profile of profiles || []) {
      try {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        // Fetch this month's transactions
        const { data: thisMonthTransactions } = await supabase
          .from("transactions")
          .select("amount, category, merchant, transaction_date")
          .eq("user_id", profile.id)
          .gte("transaction_date", monthAgo.toISOString().split("T")[0])
          .lt("amount", 0);

        // Fetch last month's transactions for comparison
        const { data: lastMonthTransactions } = await supabase
          .from("transactions")
          .select("amount, category")
          .eq("user_id", profile.id)
          .gte("transaction_date", twoMonthsAgo.toISOString().split("T")[0])
          .lt("transaction_date", monthAgo.toISOString().split("T")[0])
          .lt("amount", 0);

        // Fetch savings data
        const { data: transfers } = await supabase
          .from("transfer_history")
          .select("*")
          .eq("user_id", profile.id)
          .gte("created_at", monthAgo.toISOString());

        const { data: goals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", profile.id);

        // Fetch budgets
        const { data: budgets } = await supabase
          .from("user_budgets")
          .select("*")
          .eq("user_id", profile.id)
          .eq("is_active", true);

        // Calculate spending analytics
        const totalSpentThisMonth = thisMonthTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const totalSpentLastMonth = lastMonthTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const spendingChange = totalSpentLastMonth > 0 
          ? Math.round(((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) * 100) 
          : 0;

        // Group by category
        const categoryMap = new Map<string, number>();
        thisMonthTransactions?.forEach(t => {
          const cat = t.category || "Other";
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
        });

        const categories: SpendingCategory[] = Array.from(categoryMap.entries())
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalSpentThisMonth > 0 ? Math.round((amount / totalSpentThisMonth) * 100) : 0,
            color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Calculate savings
        const totalSaved = transfers?.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
        const goalsCompleted = goals?.filter(g => 
          parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))
        ).length || 0;

        // Generate insights
        const insights: string[] = [];
        
        if (spendingChange > 15) {
          insights.push(`⚠️ Your spending increased ${spendingChange}% compared to last month`);
        } else if (spendingChange < -10) {
          insights.push(`🎉 Excellent! You reduced spending by ${Math.abs(spendingChange)}% this month`);
        }

        if (categories.length > 0) {
          const topCat = categories[0];
          insights.push(`📊 Top category: ${topCat.category} at $${topCat.amount.toFixed(2)} (${topCat.percentage}%)`);
        }

        if (totalSaved > 0) {
          insights.push(`💰 Total saved this month: $${totalSaved.toFixed(2)}`);
        }

        if (goalsCompleted > 0) {
          insights.push(`🏆 Goals completed: ${goalsCompleted}`);
        }

        // Average daily spending
        const avgDailySpending = totalSpentThisMonth / 30;
        insights.push(`📈 Average daily spending: $${avgDailySpending.toFixed(2)}`);

        // Budget status
        const monthlyBudget = budgets?.reduce((sum, b) => sum + parseFloat(String(b.amount)), 0) || 0;
        const budgetUsedPercent = monthlyBudget > 0 ? Math.round((totalSpentThisMonth / monthlyBudget) * 100) : 0;

        // Generate category breakdown HTML
        const categoryRowsHtml = categories.map(cat => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${cat.color};"></div>
                ${cat.category}
              </div>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              $${cat.amount.toFixed(2)}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">
              ${cat.percentage}%
            </td>
          </tr>
        `).join('');

        const insightsHtml = insights.map(insight => `
          <div style="background: #f3f4f6; border-left: 3px solid #667eea; padding: 12px 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0; font-size: 14px;">
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
                  padding: 40px 32px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0 0 8px 0;
                  font-size: 28px;
                }
                .content {
                  padding: 32px;
                }
                .stats-row {
                  display: flex;
                  gap: 16px;
                  margin-bottom: 32px;
                }
                .stat-card {
                  flex: 1;
                  background: #f9fafb;
                  padding: 24px;
                  border-radius: 12px;
                  text-align: center;
                }
                .stat-value {
                  font-size: 32px;
                  font-weight: bold;
                  color: #111;
                }
                .stat-label {
                  color: #6b7280;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: 600;
                  margin: 32px 0 16px 0;
                }
                .budget-progress {
                  background: #e5e7eb;
                  border-radius: 8px;
                  height: 16px;
                  overflow: hidden;
                  margin: 16px 0;
                }
                .budget-fill {
                  background: linear-gradient(90deg, #667eea, #764ba2);
                  height: 100%;
                  border-radius: 8px;
                  transition: width 0.3s ease;
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
                  <h1>📊 Monthly Financial Report</h1>
                  <p style="margin: 0; opacity: 0.9;">Hi ${profile.full_name || 'there'}! Here's your complete spending summary.</p>
                </div>

                <div class="content">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px; background: #f9fafb; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 32px; font-weight: bold;">$${totalSpentThisMonth.toFixed(2)}</div>
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Total Spent</div>
                        ${spendingChange !== 0 ? `
                          <div style="font-size: 12px; color: ${spendingChange > 0 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
                            ${spendingChange > 0 ? '↑' : '↓'} ${Math.abs(spendingChange)}% vs last month
                          </div>
                        ` : ''}
                      </td>
                      <td style="width: 16px;"></td>
                      <td style="padding: 12px; background: #f9fafb; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 32px; font-weight: bold;">$${totalSaved.toFixed(2)}</div>
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Total Saved</div>
                      </td>
                    </tr>
                  </table>

                  ${categories.length > 0 ? `
                    <div class="section-title">💳 Spending by Category</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                      <thead>
                        <tr style="color: #6b7280; font-size: 12px; text-transform: uppercase;">
                          <th style="text-align: left; padding-bottom: 12px;">Category</th>
                          <th style="text-align: right; padding-bottom: 12px;">Amount</th>
                          <th style="text-align: right; padding-bottom: 12px;">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${categoryRowsHtml}
                      </tbody>
                    </table>
                  ` : ''}

                  ${insights.length > 0 ? `
                    <div class="section-title">💡 Monthly Insights</div>
                    ${insightsHtml}
                  ` : ''}

                  ${monthlyBudget > 0 ? `
                    <div class="section-title">📈 Budget Overview</div>
                    <div class="budget-progress">
                      <div class="budget-fill" style="width: ${Math.min(budgetUsedPercent, 100)}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                      <span style="color: #6b7280;">$${totalSpentThisMonth.toFixed(0)} of $${monthlyBudget.toFixed(0)} budget</span>
                      <span style="font-weight: 600; color: ${budgetUsedPercent > 100 ? '#ef4444' : '#10b981'};">
                        ${budgetUsedPercent > 100 ? `${budgetUsedPercent - 100}% over` : `${100 - budgetUsedPercent}% remaining`}
                      </span>
                    </div>
                  ` : ''}

                  ${goals && goals.length > 0 ? `
                    <div class="section-title">🎯 Goals Progress</div>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                      <div style="font-size: 24px; font-weight: bold;">${goals.length}</div>
                      <div style="color: #6b7280; font-size: 14px;">Active goals • ${goalsCompleted} completed this month</div>
                    </div>
                  ` : ''}
                </div>

                <div class="footer">
                  You're receiving this monthly report as a $ave+ user.<br>
                  Manage your email preferences in Settings.
                </div>
              </div>
            </body>
          </html>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "$ave+ <noreply@resend.dev>",
          to: [profile.email],
          subject: `📊 Monthly Report: $${totalSpentThisMonth.toFixed(2)} spent, $${totalSaved.toFixed(2)} saved`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          results.failed++;
          results.errors.push(`${profile.email}: ${emailError.message}`);
        } else {
          console.log(`Successfully sent monthly digest to ${profile.email}`);
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
        message: "Monthly analytics digests processed",
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
