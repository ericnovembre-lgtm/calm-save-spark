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

    const { to_address, amount, token_symbol = 'ETH', speed = 'standard' } = await req.json();

    // DEMO MODE: Return mock gas estimates
    const gasEstimates = {
      slow: {
        gas_limit: 21000,
        gas_price: '15000000000', // 15 gwei
        max_fee: '20000000000',
        max_priority_fee: '1500000000',
        estimated_time: '5-10 minutes',
        total_usd: 3.15
      },
      standard: {
        gas_limit: 21000,
        gas_price: '25000000000', // 25 gwei
        max_fee: '30000000000',
        max_priority_fee: '2500000000',
        estimated_time: '1-3 minutes',
        total_usd: 5.25
      },
      fast: {
        gas_limit: 21000,
        gas_price: '40000000000', // 40 gwei
        max_fee: '45000000000',
        max_priority_fee: '4000000000',
        estimated_time: '< 1 minute',
        total_usd: 8.40
      }
    };

    console.log(`[DEMO] Gas estimate for user ${user.id}: ${speed} speed`);

    return new Response(
      JSON.stringify({ 
        estimate: gasEstimates[speed as keyof typeof gasEstimates] || gasEstimates.standard,
        all_speeds: gasEstimates,
        demo_mode: true,
        message: 'Demo gas estimate. Not real network data.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error estimating gas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
