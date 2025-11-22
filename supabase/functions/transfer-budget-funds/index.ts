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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    const { from_budget_id, to_budget_id, amount, reason } = await req.json();

    if (!from_budget_id || !to_budget_id || !amount) {
      throw new Error('Missing required parameters');
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    // Fetch both budgets
    const { data: fromBudget, error: fromError } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('id', from_budget_id)
      .eq('user_id', user.id)
      .single();

    if (fromError || !fromBudget) throw new Error('Source budget not found');

    const { data: toBudget, error: toError } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('id', to_budget_id)
      .eq('user_id', user.id)
      .single();

    if (toError || !toBudget) throw new Error('Destination budget not found');

    // Validate transfer (can't over-withdraw)
    const fromLimit = parseFloat(String(fromBudget.total_limit));
    if (fromLimit - amount < 0) {
      throw new Error('Insufficient budget to transfer');
    }

    // Perform atomic transaction
    const { error: updateFromError } = await supabaseClient
      .from('user_budgets')
      .update({
        total_limit: fromLimit - amount,
        last_rebalanced_at: new Date().toISOString()
      })
      .eq('id', from_budget_id);

    if (updateFromError) throw updateFromError;

    const toLimit = parseFloat(String(toBudget.total_limit));
    const { error: updateToError } = await supabaseClient
      .from('user_budgets')
      .update({
        total_limit: toLimit + amount,
        last_rebalanced_at: new Date().toISOString()
      })
      .eq('id', to_budget_id);

    if (updateToError) {
      // Rollback from budget update
      await supabaseClient
        .from('user_budgets')
        .update({ total_limit: fromLimit })
        .eq('id', from_budget_id);
      throw updateToError;
    }

    // Log the transfer
    await supabaseClient
      .from('budget_transfer_log')
      .insert([{
        user_id: user.id,
        from_budget_id,
        to_budget_id,
        amount,
        reason
      }]);

    return new Response(JSON.stringify({
      success: true,
      from: { name: fromBudget.name, new_limit: fromLimit - amount },
      to: { name: toBudget.name, new_limit: toLimit + amount }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error transferring budget funds:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
