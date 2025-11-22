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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Fetch all active budgets
    const { data: budgets } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!budgets || budgets.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch current spending for each budget
    const { data: spending } = await supabaseClient
      .from('budget_spending')
      .select('*')
      .eq('user_id', user.id);

    const spendingMap: Record<string, any> = {};
    spending?.forEach(s => {
      spendingMap[s.budget_id] = s;
    });

    // Calculate days remaining (assuming monthly budgets)
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Identify budgets with surplus and shortage
    const underutilized: any[] = [];
    const overutilized: any[] = [];

    budgets.forEach(budget => {
      const spend = spendingMap[budget.id];
      const spentAmount = spend?.spent_amount || 0;
      const totalLimit = parseFloat(String(budget.total_limit));
      const remaining = totalLimit - spentAmount;
      const percentUsed = (spentAmount / totalLimit) * 100;

      // Underutilized: <50% spent with <10 days remaining
      if (percentUsed < 50 && daysRemaining < 10 && remaining > 50) {
        underutilized.push({
          budget,
          surplus: remaining,
          percentUsed
        });
      }

      // Overutilized: >90% spent with >15 days remaining
      if (percentUsed > 90 && daysRemaining > 15) {
        const shortage = spentAmount - totalLimit;
        overutilized.push({
          budget,
          shortage: Math.abs(shortage),
          percentUsed
        });
      }
    });

    // Generate rebalancing suggestions
    const suggestions: any[] = [];

    for (const over of overutilized) {
      for (const under of underutilized) {
        if (suggestions.length >= 3) break; // Max 3 suggestions

        const transferAmount = Math.min(
          under.surplus * 0.5, // Transfer up to 50% of surplus
          over.shortage * 1.2   // Cover shortage + 20% buffer
        );

        if (transferAmount >= 50) { // Minimum $50 transfer
          const confidence = Math.min(
            0.95,
            (100 - under.percentUsed) / 100 * 0.5 +
            (over.percentUsed - 90) / 10 * 0.5
          );

          suggestions.push({
            from: {
              budgetId: under.budget.id,
              name: under.budget.name,
              surplus: under.surplus
            },
            to: {
              budgetId: over.budget.id,
              name: over.budget.name,
              shortage: over.shortage
            },
            amount: Math.round(transferAmount * 100) / 100,
            confidence,
            reason: `You've only used ${under.percentUsed.toFixed(0)}% of your ${under.budget.name} budget, but ${over.budget.name} is at ${over.percentUsed.toFixed(0)}%.`
          });
        }
      }
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating rebalancing suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
