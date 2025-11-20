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
    console.log('[Insight Resolution] Received resolution request');
    const { insightId, actionType, actionData } = await req.json();
    console.log(`[Insight Resolution] Action: ${actionType}, Insight: ${insightId}`);
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('[Insight Resolution] No authorization header');
      throw new Error('Not authenticated');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Insight Resolution] Auth error:', authError);
      throw new Error('Not authenticated');
    }

    console.log(`[Insight Resolution] Processing for user ${user.id}`);
    let result;

    switch (actionType) {
      case 'cancel_subscription':
        console.log('[Insight Resolution] Cancelling subscription');
        result = await handleCancelSubscription(supabase, user.id, actionData);
        break;

      case 'create_budget':
        console.log('[Insight Resolution] Creating budget');
        result = await handleCreateBudget(supabase, user.id, actionData);
        break;

      case 'create_savings_goal':
        console.log('[Insight Resolution] Creating savings goal');
        result = await handleCreateSavingsGoal(supabase, user.id, actionData);
        break;

      case 'adjust_budget':
        console.log('[Insight Resolution] Adjusting budget');
        result = await handleAdjustBudget(supabase, user.id, actionData);
        break;

      case 'review_transactions':
        console.log('[Insight Resolution] Review transactions action');
        result = { success: true, action: 'navigate_to_transactions' };
        break;

      default:
        console.error(`[Insight Resolution] Unknown action type: ${actionType}`);
        throw new Error(`Unknown action type: ${actionType}`);
    }

    console.log('[Insight Resolution] Action completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Insight Resolution] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('Not authenticated')) {
      statusCode = 401;
    } else if (errorMessage.includes('Unknown action type')) {
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCancelSubscription(supabase: any, userId: string, data: any) {
  const { id } = data;
  console.log(`[Handler] Cancelling subscription ${id} for user ${userId}`);
  
  const { data: subscription, error } = await supabase
    .from('detected_subscriptions')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Handler] Cancel subscription error:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
  
  console.log('[Handler] Subscription cancelled successfully');
  return subscription;
}

async function handleCreateBudget(supabase: any, userId: string, data: any) {
  const { category, amount } = data;
  console.log(`[Handler] Creating budget for category ${category}, amount ${amount}`);
  
  const { data: budget, error } = await supabase
    .from('user_budgets')
    .insert({
      user_id: userId,
      category,
      amount,
      period: 'monthly'
    })
    .select()
    .single();

  if (error) {
    console.error('[Handler] Create budget error:', error);
    throw new Error(`Failed to create budget: ${error.message}`);
  }
  
  console.log('[Handler] Budget created successfully');
  return budget;
}

async function handleCreateSavingsGoal(supabase: any, userId: string, data: any) {
  const { goal_name, monthly_amount } = data;
  console.log(`[Handler] Creating savings goal: ${goal_name}, monthly amount: ${monthly_amount}`);
  
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: goal_name,
      target_amount: monthly_amount * 12,
      current_amount: 0,
      target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('[Handler] Create savings goal error:', error);
    throw new Error(`Failed to create savings goal: ${error.message}`);
  }
  
  console.log('[Handler] Savings goal created successfully');
  return goal;
}

async function handleAdjustBudget(supabase: any, userId: string, data: any) {
  const { budget_id, suggested_limit } = data;
  console.log(`[Handler] Adjusting budget ${budget_id} to ${suggested_limit}`);
  
  const { data: budget, error } = await supabase
    .from('user_budgets')
    .update({ amount: suggested_limit })
    .eq('id', budget_id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Handler] Adjust budget error:', error);
    throw new Error(`Failed to adjust budget: ${error.message}`);
  }
  
  console.log('[Handler] Budget adjusted successfully');
  return budget;
}
