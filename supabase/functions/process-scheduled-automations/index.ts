import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[Scheduled Automations] Starting scheduled automation processing...');

    // Find all active scheduled automations that are due to run
    const { data: dueAutomations, error: queryError } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('rule_type', 'scheduled_transfer')
      .eq('is_active', true)
      .lte('next_run_date', new Date().toISOString())
      .not('next_run_date', 'is', null);

    if (queryError) {
      console.error('[Scheduled Automations] Query error:', queryError);
      throw queryError;
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      console.log('[Scheduled Automations] No automations due for execution');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No automations due',
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Scheduled Automations] Found ${dueAutomations.length} automations to process`);

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const automation of dueAutomations) {
      try {
        const actionConfig = automation.action_config as any;
        const amount = actionConfig?.amount || 0;
        const targetType = actionConfig?.target_type;
        const targetId = actionConfig?.target_id;

        if (!targetType || !targetId || amount <= 0) {
          throw new Error('Invalid automation configuration');
        }

        // Apply the transfer
        if (targetType === 'goal') {
          const { error } = await supabaseClient
            .from('goals')
            .update({ 
              current_amount: supabaseClient.rpc('increment', { amount }) 
            })
            .eq('id', targetId)
            .eq('user_id', automation.user_id);

          if (error) throw error;
        } else if (targetType === 'pot') {
          const { error } = await supabaseClient
            .from('pots')
            .update({ 
              current_amount: supabaseClient.rpc('increment', { amount }) 
            })
            .eq('id', targetId)
            .eq('user_id', automation.user_id);

          if (error) throw error;
        } else {
          throw new Error('Invalid target type');
        }

        // Calculate next run date
        const currentDate = new Date(automation.next_run_date);
        let nextRunDate: Date;
        
        switch (automation.frequency) {
          case 'daily':
            nextRunDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
            break;
          case 'weekly':
            nextRunDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
            break;
          case 'bi-weekly':
            nextRunDate = new Date(currentDate.setDate(currentDate.getDate() + 14));
            break;
          case 'monthly':
            nextRunDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
            break;
          default:
            throw new Error(`Unknown frequency: ${automation.frequency}`);
        }

        // Update automation rule
        const { error: updateError } = await supabaseClient
          .from('automation_rules')
          .update({
            last_run_date: new Date().toISOString(),
            next_run_date: nextRunDate.toISOString(),
            run_count: (automation.run_count || 0) + 1,
          })
          .eq('id', automation.id);

        if (updateError) throw updateError;

        // Log successful execution
        await supabaseClient
          .from('automation_execution_log')
          .insert({
            automation_rule_id: automation.id,
            user_id: automation.user_id,
            status: 'success',
            amount_transferred: amount,
            metadata: {
              rule_name: automation.rule_name,
              frequency: automation.frequency,
              target_type: targetType,
              target_id: targetId,
              next_run_date: nextRunDate.toISOString(),
            },
          });

        successCount++;
        results.push({
          automation_id: automation.id,
          status: 'success',
          amount,
        });

        console.log(`[Scheduled Automations] ✅ Processed ${automation.rule_name} - $${amount}`);
      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log failed execution
        await supabaseClient
          .from('automation_execution_log')
          .insert({
            automation_rule_id: automation.id,
            user_id: automation.user_id,
            status: 'failed',
            error_message: errorMessage,
            metadata: {
              rule_name: automation.rule_name,
            },
          });

        results.push({
          automation_id: automation.id,
          status: 'failed',
          error: errorMessage,
        });

        console.error(`[Scheduled Automations] ❌ Failed ${automation.rule_name}:`, errorMessage);
      }
    }

    console.log(`[Scheduled Automations] Complete: ${successCount} succeeded, ${failureCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: dueAutomations.length,
        succeeded: successCount,
        failed: failureCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Scheduled Automations] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
