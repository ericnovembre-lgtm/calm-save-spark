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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all active budgets across all users
    const { data: budgets } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('is_active', true);

    if (!budgets) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    let alertsCreated = 0;

    for (const budget of budgets) {
      // Get last 3 months of spending
      const { data: spendingHistory } = await supabaseClient
        .from('budget_spending')
        .select('spent_amount, period_start, period_end')
        .eq('budget_id', budget.id)
        .gte('period_start', threeMonthsAgo.toISOString())
        .order('period_start', { ascending: false })
        .limit(3);

      if (!spendingHistory || spendingHistory.length < 3) continue;

      const totalLimit = parseFloat(String(budget.total_limit));
      const evidence: any[] = [];
      let consecutiveOverages = 0;

      for (const period of spendingHistory) {
        const spent = period.spent_amount || 0;
        const overage = spent - totalLimit;
        const overagePercent = (overage / totalLimit) * 100;

        if (overage > 0) {
          consecutiveOverages++;
          const monthStr = new Date(period.period_start).toLocaleString('default', { month: 'short', year: 'numeric' });
          evidence.push({
            month: monthStr,
            amount: spent,
            overage: overagePercent
          });
        }
      }

      // Trigger alert if 3 consecutive months of overspending
      if (consecutiveOverages >= 3) {
        const avgSpend = spendingHistory.reduce((sum, p) => sum + (p.spent_amount || 0), 0) / 3;
        const suggestedBudget = Math.ceil(avgSpend * 1.1); // Add 10% buffer

        // Check if alert already exists
        const { data: existingAlert } = await supabaseClient
          .from('budget_inflation_alerts')
          .select('id')
          .eq('budget_id', budget.id)
          .eq('status', 'pending')
          .single();

        if (!existingAlert) {
          await supabaseClient
            .from('budget_inflation_alerts')
            .insert([{
              user_id: budget.user_id,
              budget_id: budget.id,
              category: budget.name,
              old_budget: totalLimit,
              suggested_budget: suggestedBudget,
              evidence,
              reason: `Your ${budget.name} bill has been consistently higher for the past 3 months. The provider may have increased rates.`,
              status: 'pending'
            }]);

          alertsCreated++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      processed: budgets.length, 
      alerts_created: alertsCreated 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error detecting budget inflation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
