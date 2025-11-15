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

    const { wallet_id, to_address, amount, token_symbol = 'ETH' } = await req.json();

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

    // DEMO MODE: Generate mock signed transaction
    const mockTxHash = `0xdemo${Date.now()}${Math.random().toString(36).slice(2, 10)}`;

    console.log(`[DEMO] Signed transaction for user ${user.id}: ${mockTxHash}`);

    return new Response(
      JSON.stringify({ 
        signed_tx: mockTxHash,
        demo_mode: true,
        message: 'Demo transaction signed. No real signing occurred.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error signing transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
