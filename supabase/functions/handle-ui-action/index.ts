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
    const { actionType, actionData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let result;

    switch (actionType) {
      case 'transfer':
        result = await handleTransfer(supabase, user.id, actionData);
        break;

      case 'cancel_subscription':
        result = await handleCancelSubscription(supabase, user.id, actionData);
        break;

      case 'create_goal':
        result = await handleCreateGoal(supabase, user.id, actionData);
        break;

      case 'freeze_card':
        result = await handleFreezeCard(supabase, user.id, actionData);
        break;

      case 'pay_bill':
        result = await handlePayBill(supabase, user.id, actionData);
        break;

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Action error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleTransfer(supabase: any, userId: string, data: any) {
  const { fromAccountId, toAccountId, amount } = data;

  // Create transfer record
  const { data: transfer, error } = await supabase
    .from('transfers')
    .insert({
      user_id: userId,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount,
      status: 'completed',
      transfer_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return transfer;
}

async function handleCancelSubscription(supabase: any, userId: string, data: any) {
  const { id } = data;

  // Update subscription status
  const { data: subscription, error } = await supabase
    .from('subscriptions')
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

async function handleCreateGoal(supabase: any, userId: string, data: any) {
  const { name, targetAmount, targetDate, category } = data;

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name,
      target_amount: targetAmount,
      target_date: targetDate,
      current_amount: 0,
      category: category || 'general',
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return goal;
}

async function handleFreezeCard(supabase: any, userId: string, data: any) {
  const { cardId } = data;

  const { data: card, error } = await supabase
    .from('cards')
    .update({ 
      status: 'frozen',
      frozen_at: new Date().toISOString()
    })
    .eq('id', cardId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return card;
}

async function handlePayBill(supabase: any, userId: string, data: any) {
  const { billId, amount } = data;

  // Create payment transaction
  const { data: payment, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: -Math.abs(amount),
      description: `Bill payment`,
      category: 'bills',
      date: new Date().toISOString(),
      merchant: 'Bill Payment',
      metadata: { bill_id: billId }
    })
    .select()
    .single();

  if (error) throw error;
  return payment;
}
