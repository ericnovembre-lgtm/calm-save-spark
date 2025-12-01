import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    const actions: Array<{
      id: string;
      type: "urgent" | "important" | "opportunity";
      title: string;
      description: string;
      priority: number;
    }> = [];

    // Check liquidity
    const { data: accounts } = await supabase
      .from("connected_accounts")
      .select("balance")
      .eq("user_id", user.id);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("transaction_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
    const weeklySpending = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0) || 0;

    if (totalBalance < weeklySpending * 2) {
      actions.push({
        id: "low-liquidity",
        type: "urgent",
        title: "Low Liquidity Alert",
        description: `Your available cash is below 2 weeks of spending ($${totalBalance.toFixed(0)})`,
        priority: 10,
      });
    }

    // Check for yield optimization opportunities
    const { data: pots } = await supabase
      .from("pots")
      .select("current_amount, apy")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const lowYieldPots = pots?.filter(p => Number(p.apy || 0) < 3.0 && Number(p.current_amount || 0) > 1000);
    if (lowYieldPots && lowYieldPots.length > 0) {
      const amount = lowYieldPots.reduce((sum, p) => sum + Number(p.current_amount || 0), 0);
      const gain = amount * 0.015; // 1.5% additional yield
      actions.push({
        id: "yield-optimization",
        type: "opportunity",
        title: "Yield Optimization Available",
        description: `Move $${amount.toFixed(0)} to HYSA for +$${gain.toFixed(0)}/yr`,
        priority: 8,
      });
    }

    // Check for budget overruns
    const { data: budgets } = await supabase
      .from("user_budgets")
      .select("id, budget_name, amount")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const { data: spending } = await supabase
      .from("budget_spending")
      .select("budget_id, spent_amount")
      .eq("user_id", user.id)
      .in("budget_id", budgets?.map(b => b.id) || []);

    const overrunBudgets = budgets?.filter(b => {
      const spent = spending?.find(s => s.budget_id === b.id);
      return spent && Number(spent.spent_amount || 0) > Number(b.amount) * 0.85;
    });

    if (overrunBudgets && overrunBudgets.length > 0) {
      actions.push({
        id: "budget-review",
        type: "important",
        title: "Budget Review Needed",
        description: `${overrunBudgets.length} budget(s) at >85% capacity`,
        priority: 7,
      });
    }

    // Check for idle subscriptions
    const { data: subscriptions } = await supabase
      .from("detected_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const unusedSubs = subscriptions?.filter(sub => {
      const lastCharge = new Date(sub.last_charge_date || 0);
      return Date.now() - lastCharge.getTime() > 45 * 24 * 60 * 60 * 1000; // 45 days
    });

    if (unusedSubs && unusedSubs.length > 0) {
      const savings = unusedSubs.reduce((sum, s) => sum + Number(s.estimated_amount || 0), 0) * 12;
      actions.push({
        id: "unused-subscriptions",
        type: "opportunity",
        title: "Unused Subscriptions Detected",
        description: `Cancel ${unusedSubs.length} unused subscription(s) for +$${savings.toFixed(0)}/yr`,
        priority: 6,
      });
    }

    // Sort by priority and return top 3
    const topActions = actions.sort((a, b) => b.priority - a.priority).slice(0, 3);

    return new Response(
      JSON.stringify({ actions: topActions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error generating critical actions:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
