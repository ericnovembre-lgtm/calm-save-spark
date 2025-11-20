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

    const { public_token } = await req.json();
    if (!public_token) {
      throw new Error('public_token is required');
    }

    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');

    console.log('Exchanging public token for access token');

    // Exchange public token for access token
    const exchangeResponse = await fetch(`https://${plaidEnv}.plaid.com/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        public_token,
      }),
    });

    const exchangeData = await exchangeResponse.json();
    if (!exchangeResponse.ok) {
      throw new Error(exchangeData.error_message || 'Failed to exchange token');
    }

    const { access_token, item_id } = exchangeData;

    // Get accounts
    const accountsResponse = await fetch(`https://${plaidEnv}.plaid.com/accounts/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        access_token,
      }),
    });

    const accountsData = await accountsResponse.json();
    if (!accountsResponse.ok) {
      throw new Error(accountsData.error_message || 'Failed to get accounts');
    }

    // Get institution info
    const institution = accountsData.item.institution_id;
    const institutionResponse = await fetch(`https://${plaidEnv}.plaid.com/institutions/get_by_id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        institution_id: institution,
        country_codes: ['US'],
      }),
    });

    const institutionData = await institutionResponse.json();
    const institutionName = institutionData.institution?.name || 'Unknown Bank';
    const institutionLogo = institutionData.institution?.logo || null;

    // Store Plaid item (one per connection)
    const { data: plaidItem, error: itemError } = await supabaseClient
      .from('plaid_items')
      .insert({
        user_id: user.id,
        item_id: item_id,
        access_token: access_token,
        institution_id: institution,
        institution_name: institutionName,
        institution_logo: institutionLogo,
        status: 'active',
      })
      .select()
      .single();

    if (itemError) {
      console.error('Error storing Plaid item:', itemError);
      throw new Error('Failed to store Plaid item');
    }

    console.log('Stored Plaid item:', plaidItem.id);

    // Store connected accounts (one per account under the item)
    const accountsToInsert = accountsData.accounts.map((account: any) => ({
      user_id: user.id,
      plaid_item_table_id: plaidItem.id,
      plaid_access_token: access_token, // Keep for backward compatibility
      plaid_item_id: item_id, // Keep for backward compatibility
      plaid_account_id: account.account_id,
      institution_name: institutionName,
      institution_id: institution,
      institution_logo: institutionLogo,
      account_type: account.subtype || account.type,
      account_mask: account.mask,
      balance: account.balances.current,
      available_balance: account.balances.available,
      current_balance: account.balances.current,
      currency: account.balances.iso_currency_code || 'USD',
      sync_status: 'active',
      last_synced: new Date().toISOString(),
    }));

    const { error: insertError } = await supabaseClient
      .from('connected_accounts')
      .insert(accountsToInsert);

    if (insertError) {
      console.error('Error storing accounts:', insertError);
      throw insertError;
    }

    console.log(`Successfully connected ${accountsToInsert.length} accounts`);

    return new Response(
      JSON.stringify({ 
        success: true,
        accounts_connected: accountsToInsert.length,
        institution: institutionName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error exchanging Plaid token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});