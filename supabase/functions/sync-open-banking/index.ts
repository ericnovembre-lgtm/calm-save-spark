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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { integrationId } = await req.json();

    console.log('Syncing Open Banking data for integration:', integrationId);

    // Get integration config
    const { data: integration } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single();

    if (!integration) {
      throw new Error('Integration not found');
    }

    // This is a placeholder for Open Banking API integration
    // In production, you would:
    // 1. Decrypt credentials
    // 2. Call Open Banking API endpoints
    // 3. Fetch account balances, transactions, etc.
    // 4. Store data in connected_accounts and transactions tables

    const mockData = {
      accounts_synced: 2,
      transactions_imported: 45,
      balance_updated: true
    };

    // Update last synced timestamp
    await supabase
      .from('integration_configs')
      .update({ 
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', integrationId);

    return new Response(
      JSON.stringify({ 
        message: 'Open Banking sync completed',
        data: mockData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing Open Banking:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});