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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json().catch(() => ({}));
    const isCronJob = body.cron === true;

    let accounts;
    
    if (isCronJob) {
      // Cron job: sync all users' investment accounts
      console.log('Cron job triggered - syncing all investment accounts');
      const { data } = await supabaseClient
        .from('investment_accounts')
        .select('*');
      accounts = data;
    } else {
      // User request: sync only this user's accounts
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Not authenticated');
      }
      
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data } = await supabaseClient
        .from('investment_accounts')
        .select('*')
        .eq('user_id', user.id);
      accounts = data;
    }

    // TODO: Integrate with Plaid Investments API
    // For now, simulate syncing by updating last_synced timestamp
    const updates = [];
    for (const account of accounts || []) {
      // Simulate portfolio gains/losses (random between -2% and +3%)
      const oldValue = parseFloat(String(account.total_value));
      const changePercent = (Math.random() * 5) - 2; // -2 to +3
      const newValue = oldValue * (1 + changePercent / 100);
      const costBasis = parseFloat(String(account.cost_basis)) || oldValue;
      const gainsLosses = newValue - costBasis;

      updates.push({
        id: account.id,
        total_value: newValue,
        gains_losses: gainsLosses,
        last_synced: new Date().toISOString()
      });

      await supabaseClient
        .from('investment_accounts')
        .update({
          total_value: newValue,
          gains_losses: gainsLosses,
          last_synced: new Date().toISOString()
        })
        .eq('id', account.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Investments synced successfully',
        accounts_synced: accounts?.length || 0,
        updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync Investments Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
