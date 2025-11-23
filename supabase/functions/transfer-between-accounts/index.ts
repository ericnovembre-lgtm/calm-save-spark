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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { fromAccountId, toAccountId, amount } = await req.json();

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid transfer parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch both accounts
    const { data: fromAccount } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', fromAccountId)
      .eq('user_id', user.id)
      .single();

    const { data: toAccount } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', toAccountId)
      .eq('user_id', user.id)
      .single();

    if (!fromAccount || !toAccount) {
      return new Response(JSON.stringify({ error: 'Accounts not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fromBalance = fromAccount.current_balance || fromAccount.balance || 0;

    if (fromBalance < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient funds' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update balances
    await supabase
      .from('connected_accounts')
      .update({ current_balance: fromBalance - amount })
      .eq('id', fromAccountId);

    const toBalance = toAccount.current_balance || toAccount.balance || 0;
    await supabase
      .from('connected_accounts')
      .update({ current_balance: toBalance + amount })
      .eq('id', toAccountId);

    // Create transaction records
    await supabase.from('transactions').insert([
      {
        user_id: user.id,
        amount: -amount,
        date: new Date().toISOString(),
        merchant: `Transfer to ${toAccount.institution_name}`,
        category: 'Transfer',
        account_id: fromAccountId,
      },
      {
        user_id: user.id,
        amount: amount,
        date: new Date().toISOString(),
        merchant: `Transfer from ${fromAccount.institution_name}`,
        category: 'Transfer',
        account_id: toAccountId,
      },
    ]);

    return new Response(JSON.stringify({ 
      success: true,
      newFromBalance: fromBalance - amount,
      newToBalance: toBalance + amount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in transfer-between-accounts:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});