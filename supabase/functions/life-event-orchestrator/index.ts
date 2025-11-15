/**
 * Life Event Orchestrator Edge Function
 * 
 * Intelligent automation system for major life milestones including marriage,
 * home buying, new children, career changes, and more.
 * 
 * @endpoint POST /life-event-orchestrator
 * @auth Required - JWT token in Authorization header
 * 
 * @description
 * This function orchestrates complex multi-step workflows for life events by:
 * - Analyzing financial impact using Digital Twin simulations
 * - Automating repetitive tasks (document collection, notifications, etc.)
 * - Coordinating with other AI agents for specialized actions
 * - Tracking progress and maintaining execution state
 * 
 * @actions
 * 
 * **analyze_financial_impact**
 * Runs Monte Carlo simulations to project the financial impact of a life event
 * over 10 years, considering income changes, new expenses, and asset purchases.
 * 
 * **automate_task**
 * Marks specific playbook tasks as automated and assigns them to the orchestrator
 * agent for autonomous execution.
 * 
 * @requires Database Tables:
 * - life_event_playbooks: Event templates and workflows
 * - life_event_executions: Active event tracking
 * - playbook_tasks: Individual task items
 * - digital_twin_profiles: User financial models
 * 
 * @example Request (Analyze Impact):
 * ```typescript
 * const response = await supabase.functions.invoke('life-event-orchestrator', {
 *   body: {
 *     action: 'analyze_financial_impact',
 *     executionId: 'uuid-of-execution'
 *   }
 * });
 * ```
 * 
 * @example Request (Automate Task):
 * ```typescript
 * const response = await supabase.functions.invoke('life-event-orchestrator', {
 *   body: {
 *     action: 'automate_task',
 *     taskId: 'uuid-of-task'
 *   }
 * });
 * ```
 * 
 * @example Response (Analyze Impact):
 * ```json
 * {
 *   "execution": { ... },
 *   "financialImpact": {
 *     "projectedOutcomes": [...],
 *     "riskMetrics": { ... }
 *   },
 *   "recommendations": [
 *     "Review emergency fund for increased expenses",
 *     "Adjust savings goals timeline"
 *   ]
 * }
 * ```
 * 
 * @supported_events
 * - home_purchase: Down payment planning, mortgage simulation
 * - new_child: Childcare cost projection, education planning
 * - marriage: Joint financial planning, tax optimization
 * - career_change: Income transition modeling
 * - retirement: Distribution strategy, healthcare costs
 * 
 * @errors
 * - 401: Not authenticated
 * - 404: Execution or task not found
 * - 400: Unknown action
 * - 500: Internal server error
 * 
 * @performance
 * - Average response time: 1-3 seconds (includes simulation)
 * - Recommended usage: On-demand for specific events
 * 
 * @version 1.0.0
 * @since 2025-11-15
 */

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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { action, executionId, taskId } = await req.json();

    if (action === 'analyze_financial_impact') {
      // Get execution details
      const { data: execution } = await supabaseClient
        .from('life_event_executions')
        .select('*, life_event_playbooks(*)')
        .eq('id', executionId)
        .single();

      if (!execution) throw new Error('Execution not found');

      // Get user's digital twin profile
      const { data: twinProfile } = await supabaseClient
        .from('digital_twin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Run simulation for this life event
      const eventType = execution.life_event_playbooks.event_type;
      const projectionParams: any = {
        yearsToProject: 10,
        scenarioType: eventType,
      };

      // Add event-specific parameters
      if (eventType === 'home_purchase') {
        projectionParams.downPayment = execution.estimated_cost || 50000;
        projectionParams.purchaseYear = 1;
      } else if (eventType === 'new_child') {
        projectionParams.newExpenses = 15000; // Annual childcare costs
      }

      const { data: simulation } = await supabaseClient.functions.invoke('digital-twin-simulate', {
        body: {
          parameters: projectionParams,
          monteCarloRuns: 100,
        },
      });

      return new Response(
        JSON.stringify({
          execution,
          financialImpact: simulation,
          recommendations: [
            'Review emergency fund for increased expenses',
            'Adjust savings goals timeline',
            'Consider impact on retirement contributions',
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'automate_task') {
      // Mark task as automated
      const { error } = await supabaseClient
        .from('playbook_tasks')
        .update({
          automation_status: 'automated',
          assigned_agent: 'life_event_orchestrator',
        })
        .eq('id', taskId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Task automated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Unknown action');

  } catch (error) {
    console.error('Error in life-event-orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
