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

    // Fetch connected accounts for the user
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_status', 'active');

    if (accountsError) throw accountsError;

    // TODO: Integrate with Plaid API to fetch real transactions
    // For now, we'll simulate syncing by updating last_synced timestamp
    for (const account of accounts || []) {
      await supabaseClient
        .from('connected_accounts')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', account.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Accounts synced successfully',
        accounts_synced: accounts?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
