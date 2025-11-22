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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId } = await req.json();

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Get active transaction-match automations for this user
    const { data: automations, error: autoError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', transaction.user_id)
      .eq('is_active', true)
      .eq('rule_type', 'transaction_match');

    if (autoError) throw autoError;

    const results = [];

    for (const automation of automations || []) {
      const trigger = automation.trigger_condition as any;
      let matched = true;

      // Match merchant
      if (trigger.merchant) {
        const merchantPattern = new RegExp(trigger.merchant, 'i');
        if (!merchantPattern.test(transaction.merchant || '')) {
          matched = false;
        }
      }

      // Match category
      if (trigger.category && transaction.category !== trigger.category) {
        matched = false;
      }

      // Match amount range
      if (trigger.amount_min && Math.abs(transaction.amount) < trigger.amount_min) {
        matched = false;
      }
      if (trigger.amount_max && Math.abs(transaction.amount) > trigger.amount_max) {
        matched = false;
      }

      if (matched) {
        // Execute automation
        const action = automation.action_config as any;
        let transferAmount = 0;

        if (action.amount) {
          transferAmount = action.amount;
        } else if (action.percentage) {
          transferAmount = Math.abs(transaction.amount) * (action.percentage / 100);
        }

        // Log execution
        const { error: logError } = await supabase
          .from('automation_execution_log')
          .insert({
            automation_rule_id: automation.id,
            user_id: transaction.user_id,
            status: 'success',
            amount_transferred: transferAmount,
            executed_at: new Date().toISOString(),
            metadata: {
              rule_name: automation.rule_name,
              transaction_id: transactionId,
              merchant: transaction.merchant,
              trigger_type: 'transaction_match'
            }
          });

        if (logError) {
          console.error('Log error:', logError);
        }

        // Update run count and last run date
        await supabase
          .from('automation_rules')
          .update({
            last_run_date: new Date().toISOString(),
            run_count: (automation.run_count || 0) + 1
          })
          .eq('id', automation.id);

        results.push({
          automation_id: automation.id,
          rule_name: automation.rule_name,
          amount: transferAmount,
          status: 'success'
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
