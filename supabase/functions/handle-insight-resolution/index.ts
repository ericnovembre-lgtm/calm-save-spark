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
    const { insightId, actionType, actionData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) throw new Error('Not authenticated');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let result;

    switch (actionType) {
      case 'cancel_subscription':
        result = await handleCancelSubscription(supabase, user.id, actionData);
        break;

      case 'create_budget':
        result = await handleCreateBudget(supabase, user.id, actionData);
        break;

      case 'create_savings_goal':
        result = await handleCreateSavingsGoal(supabase, user.id, actionData);
        break;

      case 'adjust_budget':
        result = await handleAdjustBudget(supabase, user.id, actionData);
        break;

      case 'review_transactions':
        // Just return success - UI will navigate to transactions page
        result = { success: true, action: 'navigate_to_transactions' };
        break;

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resolution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCancelSubscription(supabase: any, userId: string, data: any) {
  const { id } = data;
  
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

  if (error) throw error;
  return subscription;
}

async function handleCreateBudget(supabase: any, userId: string, data: any) {
  const { category, amount } = data;
  
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

  if (error) throw error;
  return budget;
}

async function handleCreateSavingsGoal(supabase: any, userId: string, data: any) {
  const { goal_name, monthly_amount } = data;
  
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

  if (error) throw error;
  return goal;
}

async function handleAdjustBudget(supabase: any, userId: string, data: any) {
  const { budget_id, suggested_limit } = data;
  
  const { data: budget, error } = await supabase
    .from('user_budgets')
    .update({ amount: suggested_limit })
    .eq('id', budget_id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return budget;
}
