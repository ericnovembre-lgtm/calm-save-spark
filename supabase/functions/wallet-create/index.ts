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

    const { chain = 'ethereum' } = await req.json();

    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('chain', chain)
      .single();

    if (existingWallet) {
      return new Response(
        JSON.stringify({ wallet: existingWallet }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DEMO MODE: Generate deterministic demo address based on user ID
    const demoAddress = `0x${user.id.slice(0, 8)}${user.id.slice(-32)}`.toLowerCase();

    // Create wallet record
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        chain,
        address: demoAddress,
        encrypted_key_share: 'DEMO_MODE_NO_REAL_KEY'
      })
      .select()
      .single();

    if (walletError) throw walletError;

    console.log(`[DEMO] Created wallet for user ${user.id}: ${demoAddress}`);

    return new Response(
      JSON.stringify({ 
        wallet,
        demo_mode: true,
        message: 'Demo wallet created. No real blockchain interaction.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating wallet:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
