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

    const { userId, state } = await req.json();

    // Fetch user financial data
    const { data: accounts } = await supabase
      .from("connected_accounts")
      .select("balance")
      .eq("user_id", userId);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, transaction_date")
      .eq("user_id", userId)
      .gte("transaction_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("transaction_date", { ascending: false });

    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
    const monthlySpending = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0) || 0;
    const savingsRate = totalBalance > 0 ? ((totalBalance / (totalBalance + monthlySpending)) * 100) : 0;

    // Generate contextual insight based on state
    let insight = "";
    
    if (state === "critical") {
      insight = `Critical: Your liquidity is tight. Monthly spending ($${monthlySpending.toFixed(0)}) is consuming ${(100 - savingsRate).toFixed(0)}% of available resources. Immediate action needed to prevent overdraft risk.`;
    } else if (state === "warning") {
      insight = `Attention needed: You're optimizing for long-term growth, but your short-term liquidity needs improvement. Current savings rate: ${savingsRate.toFixed(1)}%. Consider reallocating $${(monthlySpending * 0.1).toFixed(0)} to emergency reserves.`;
    } else {
      insight = `You're in a strong position. Maintaining a ${savingsRate.toFixed(1)}% savings rate with ${accounts?.length || 0} active accounts. Continue current strategy to maximize compound growth.`;
    }

    return new Response(
      JSON.stringify({ insight, metrics: { totalBalance, monthlySpending, savingsRate } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating DNA insight:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
