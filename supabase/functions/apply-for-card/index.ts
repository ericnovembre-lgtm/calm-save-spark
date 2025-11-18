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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { account_type, credit_limit_cents, source_account_id } = await req.json();

    // Validate request
    if (!['secured', 'credit'].includes(account_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid account type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has an active application
    const { data: existing } = await supabaseClient
      .from('card_accounts')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending'])
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'You already have an active card account or pending application' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create card account
    const { data: account, error: accountError } = await supabaseClient
      .from('card_accounts')
      .insert({
        user_id: user.id,
        account_type,
        credit_limit_cents: credit_limit_cents || 50000,
        available_cents: credit_limit_cents || 50000,
        status: 'pending',
      })
      .select()
      .single();

    if (accountError) throw accountError;

    // If secured card, setup collateral
    if (account_type === 'secured' && source_account_id) {
      const collateralAmount = Math.max(10000, credit_limit_cents || 50000);
      
      const { error: collateralError } = await supabaseClient
        .from('card_collateral')
        .insert({
          account_id: account.id,
          user_id: user.id,
          source_account_id,
          collateral_cents: collateralAmount,
          status: 'active',
        });

      if (collateralError) throw collateralError;
    }

    // Create default card controls
    await supabaseClient
      .from('card_controls')
      .insert({
        account_id: account.id,
        user_id: user.id,
        daily_spend_limit_cents: 100000, // $1000
        single_transaction_limit_cents: 50000, // $500
        international_enabled: false,
        online_enabled: true,
        contactless_enabled: true,
        atm_enabled: false,
      });

    return new Response(
      JSON.stringify({
        success: true,
        account,
        next_steps: ['identity_verification', 'card_issuance']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Card application error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
