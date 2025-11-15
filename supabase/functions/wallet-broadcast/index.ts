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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      wallet_id, 
      to_address, 
      amount, 
      token_symbol = 'ETH',
      token_address = null,
      gas_limit,
      gas_price 
    } = await req.json();

    // Verify wallet ownership
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', wallet_id)
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      throw new Error('Wallet not found or unauthorized');
    }

    // DEMO MODE: Generate mock transaction hash
    const mockTxHash = `0xdemo${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
    const mockBlockNumber = Math.floor(Math.random() * 1000000) + 18000000;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id,
        user_id: user.id,
        hash: mockTxHash,
        from_address: wallet.address,
        to_address,
        amount,
        token_symbol,
        token_address,
        status: 'pending',
        gas_used: gas_limit || 21000,
        gas_price,
        block_number: mockBlockNumber,
        transaction_type: 'send',
        metadata: {
          demo_mode: true,
          simulated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (txError) throw txError;

    // Simulate transaction confirmation after 3 seconds
    setTimeout(async () => {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'confirmed' })
        .eq('id', transaction.id);
      
      console.log(`[DEMO] Transaction confirmed: ${mockTxHash}`);
    }, 3000);

    console.log(`[DEMO] Broadcast transaction for user ${user.id}: ${mockTxHash}`);

    return new Response(
      JSON.stringify({ 
        transaction,
        tx_hash: mockTxHash,
        demo_mode: true,
        message: 'Demo transaction broadcast. Will auto-confirm in 3 seconds.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error broadcasting transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
