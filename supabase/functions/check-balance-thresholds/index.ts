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

    // Get all active balance threshold automations
    const { data: automations, error: autoError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .eq('rule_type', 'balance_threshold');

    if (autoError) throw autoError;

    const results = [];

    for (const automation of automations || []) {
      const trigger = automation.trigger_condition as any;
      
      // In a real implementation, you would fetch the user's current balance
      // from their connected accounts. For now, we'll skip execution.
      // This is a placeholder for the actual balance checking logic.

      // Check if automation was triggered recently to prevent duplicate executions
      const lastRun = automation.last_run_date 
        ? new Date(automation.last_run_date).getTime()
        : 0;
      const hoursSinceLastRun = (Date.now() - lastRun) / (1000 * 60 * 60);

      // Only trigger if at least 24 hours have passed
      if (hoursSinceLastRun < 24) {
        continue;
      }

      // TODO: Implement actual balance checking when account integration is available
      // For now, just log that we checked
      console.log(`Checking balance threshold for automation: ${automation.rule_name}`);
      
      results.push({
        automation_id: automation.id,
        rule_name: automation.rule_name,
        status: 'checked'
      });
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
