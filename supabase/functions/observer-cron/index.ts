import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Observer Cron] Starting scheduled run...');

  try {
    // Verify this is a cron job or service role request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)) {
      console.error('[Observer Cron] Unauthorized access attempt');
      throw new Error('Unauthorized - requires service role key');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all active users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('[Observer Cron] Failed to list users:', usersError);
      throw usersError;
    }

    console.log(`[Observer Cron] Processing ${users.length} users...`);

    let totalInsights = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`[Observer Cron] Analyzing user ${user.id}...`);
        
        const insights = await detectInsights(supabaseAdmin, user.id);

        if (insights.length > 0) {
          console.log(`[Observer Cron] Found ${insights.length} insights for user ${user.id}`);
          
          // Insert new insights
          const { error: insertError } = await supabaseAdmin
            .from('proactive_insights')
            .insert(
              insights.map(insight => ({
                user_id: user.id,
                ...insight,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
              }))
            );

          if (insertError) {
            console.error(`[Observer Cron] Error inserting insights for user ${user.id}:`, insertError);
            errorCount++;
          } else {
            totalInsights += insights.length;
            successCount++;
            console.log(`[Observer Cron] Successfully inserted ${insights.length} insights for user ${user.id}`);
          }
        } else {
          console.log(`[Observer Cron] No new insights for user ${user.id}`);
          successCount++;
        }
      } catch (userError) {
        console.error(`[Observer Cron] Error processing user ${user.id}:`, userError);
        errorCount++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Observer Cron] Completed in ${duration}ms - ${successCount} successful, ${errorCount} errors, ${totalInsights} total insights`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        users_processed: users.length,
        successful: successCount,
        errors: errorCount,
        total_insights: totalInsights,
        duration_ms: duration
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Observer Cron] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: duration
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

interface InsightDetection {
  insight_type: string;
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  resolution_action?: string;
  resolution_data?: Record<string, any>;
  related_entity_id?: string;
  related_entity_type?: string;
}

async function detectInsights(supabase: any, userId: string): Promise<InsightDetection[]> {
  const insights: InsightDetection[] = [];

  try {
    // 1. Check for subscription price hikes
    console.log(`[Detector] Checking subscriptions for user ${userId}...`);
    const { data: subscriptions, error: subError } = await supabase
      .from('detected_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('confirmed', true);

    if (subError) {
      console.error('[Detector] Subscription query error:', subError);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`[Detector] Found ${subscriptions.length} subscriptions`);
      
      for (const sub of subscriptions) {
        const currentAmount = parseFloat(sub.amount) || 0;
        const lastChargeAmount = sub.last_charge_amount ? parseFloat(sub.last_charge_amount) : currentAmount;
        
        if (lastChargeAmount > currentAmount * 1.1) { // 10% increase
          console.log(`[Detector] Price hike detected for ${sub.merchant}: $${currentAmount} -> $${lastChargeAmount}`);
          insights.push({
            insight_type: 'subscription_price_hike',
            severity: 'urgent',
            title: `${sub.merchant} Price Increase Detected`,
            message: `Your ${sub.merchant} subscription increased from $${currentAmount.toFixed(2)} to $${lastChargeAmount.toFixed(2)}. This adds $${((lastChargeAmount - currentAmount) * 12).toFixed(2)}/year.`,
            resolution_action: 'cancel_subscription',
            resolution_data: { id: sub.id, merchant: sub.merchant },
            related_entity_id: sub.id,
            related_entity_type: 'subscription'
          });
        }
      }
    }

    // 2. Detect spending spikes (30% above 30-day average)
    console.log(`[Detector] Checking spending patterns for user ${userId}...`);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentTransactions, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', thirtyDaysAgo)
      .order('transaction_date', { ascending: false });

    if (txnError) {
      console.error('[Detector] Transaction query error:', txnError);
    } else if (recentTransactions && recentTransactions.length > 10) {
      console.log(`[Detector] Analyzing ${recentTransactions.length} recent transactions`);
      
      const amounts = recentTransactions
        .filter((t: any) => parseFloat(t.amount) < 0)
        .map((t: any) => Math.abs(parseFloat(t.amount)));
      
      if (amounts.length > 0) {
        const avg = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
        const last7Days = amounts.slice(0, Math.min(7, amounts.length));
        const recentAvg = last7Days.reduce((a: number, b: number) => a + b, 0) / last7Days.length;

        if (recentAvg > avg * 1.3) { // 30% spike
          console.log(`[Detector] Spending spike detected: ${Math.round(((recentAvg - avg) / avg) * 100)}% increase`);
          insights.push({
            insight_type: 'spending_spike',
            severity: 'warning',
            title: 'Unusual Spending Spike Detected',
            message: `Your spending increased by ${Math.round(((recentAvg - avg) / avg) * 100)}% this week ($${recentAvg.toFixed(2)}/day vs $${avg.toFixed(2)}/day average). Consider reviewing recent transactions.`,
            resolution_action: 'review_transactions',
            resolution_data: { category: 'all', period: '7_days' }
          });
        }
      }
    }

    // 3. Check budget overruns
    console.log(`[Detector] Checking budgets for user ${userId}...`);
    const { data: budgets, error: budgetError } = await supabase
      .from('user_budgets')
      .select(`
        *,
        budget_spending!inner(spent_amount)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (budgetError) {
      console.error('[Detector] Budget query error:', budgetError);
    } else if (budgets && budgets.length > 0) {
      console.log(`[Detector] Checking ${budgets.length} budgets`);
      
      for (const budget of budgets) {
        const spent = budget.budget_spending?.[0]?.spent_amount || 0;
        const limit = parseFloat(budget.amount);
        const percentage = (spent / limit) * 100;

        if (percentage > 90 && percentage < 100) {
          console.log(`[Detector] Budget alert for ${budget.category}: ${Math.round(percentage)}% used`);
          insights.push({
            insight_type: 'budget_overrun',
            severity: 'warning',
            title: `${budget.category} Budget Alert`,
            message: `You've used ${Math.round(percentage)}% of your ${budget.category} budget ($${spent.toFixed(2)}/$${limit.toFixed(2)}). Consider adjusting your budget or reducing spending.`,
            resolution_action: 'adjust_budget',
            resolution_data: { 
              budget_id: budget.id, 
              category: budget.category,
              current_limit: limit,
              suggested_limit: Math.ceil(spent * 1.2)
            },
            related_entity_id: budget.id,
            related_entity_type: 'budget'
          });
        }
      }
    }

    // 4. Savings opportunities (recurring small charges)
    if (recentTransactions) {
      const smallCharges = recentTransactions.filter((t: any) => {
        const amount = Math.abs(parseFloat(t.amount));
        return amount < 10 && t.merchant?.toLowerCase().includes('coffee');
      });

      if (smallCharges.length > 10) {
        const total = smallCharges.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0);
        console.log(`[Detector] Coffee savings opportunity: $${total.toFixed(2)} across ${smallCharges.length} purchases`);
        insights.push({
          insight_type: 'savings_opportunity',
          severity: 'info',
          title: 'Coffee Spending Opportunity',
          message: `You've spent $${total.toFixed(2)} on coffee this month (${smallCharges.length} purchases). Brewing at home could save $${(total * 0.7).toFixed(2)}/month.`,
          resolution_action: 'create_savings_goal',
          resolution_data: { 
            goal_name: 'Coffee Savings',
            monthly_amount: Math.round(total * 0.7)
          }
        });
      }
    }

    console.log(`[Detector] Completed analysis for user ${userId}: ${insights.length} insights found`);
    return insights;

  } catch (error) {
    console.error(`[Detector] Error detecting insights for user ${userId}:`, error);
    return insights; // Return whatever insights we found before the error
  }
}
