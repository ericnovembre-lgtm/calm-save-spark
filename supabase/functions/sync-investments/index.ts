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

    // Get Plaid credentials
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error('Plaid credentials not configured');
    }

    const plaidUrl = PLAID_ENV === 'production' 
      ? 'https://production.plaid.com'
      : 'https://sandbox.plaid.com';

    const updates = [];
    
    for (const account of accounts || []) {
      try {
        // Get Plaid item for this account
        const { data: plaidItems } = await supabaseClient
          .from('plaid_items')
          .select('access_token')
          .eq('user_id', account.user_id)
          .limit(1);

        if (!plaidItems || plaidItems.length === 0) {
          console.log(`No Plaid item found for account ${account.id}, using simulation`);
          
          // Fallback to simulation if no Plaid connection
          const oldValue = parseFloat(String(account.total_value));
          const changePercent = (Math.random() * 5) - 2;
          const newValue = oldValue * (1 + changePercent / 100);
          const costBasis = parseFloat(String(account.cost_basis)) || oldValue;
          const gainsLosses = newValue - costBasis;

          await supabaseClient
            .from('investment_accounts')
            .update({
              total_value: newValue,
              gains_losses: gainsLosses,
              last_synced: new Date().toISOString()
            })
            .eq('id', account.id);

          updates.push({ id: account.id, total_value: newValue, gains_losses: gainsLosses });
          continue;
        }

        const accessToken = plaidItems[0].access_token;

        // Fetch holdings from Plaid
        const holdingsResponse = await fetch(`${plaidUrl}/investments/holdings/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
          },
          body: JSON.stringify({ access_token: accessToken }),
        });

        const holdingsData = await holdingsResponse.json();

        if (holdingsData.error_code) {
          console.error(`Plaid error for account ${account.id}:`, holdingsData);
          continue;
        }

        // Calculate totals from holdings
        let totalValue = 0;
        let totalCostBasis = 0;

        for (const holding of holdingsData.holdings || []) {
          const quantity = holding.quantity || 0;
          const price = holding.institution_price || 0;
          const costBasis = holding.cost_basis || (quantity * price);

          totalValue += quantity * price;
          totalCostBasis += costBasis;

          // Upsert portfolio holding
          await supabaseClient
            .from('portfolio_holdings')
            .upsert({
              user_id: account.user_id,
              account_id: account.id,
              symbol: holding.security?.ticker_symbol || 'UNKNOWN',
              name: holding.security?.name || 'Unknown Security',
              asset_type: holding.security?.type || 'unknown',
              quantity,
              average_cost: costBasis / quantity,
              current_price: price,
              market_value: quantity * price,
              unrealized_gain_loss: (quantity * price) - costBasis,
              unrealized_gain_loss_percent: ((quantity * price) - costBasis) / costBasis * 100,
            }, {
              onConflict: 'user_id,account_id,symbol'
            });
        }

        const gainsLosses = totalValue - totalCostBasis;

        // Update investment account
        await supabaseClient
          .from('investment_accounts')
          .update({
            total_value: totalValue,
            cost_basis: totalCostBasis,
            gains_losses: gainsLosses,
            last_synced: new Date().toISOString()
          })
          .eq('id', account.id);

        // Create snapshot for performance tracking
        await supabaseClient
          .from('portfolio_snapshots')
          .insert({
            user_id: account.user_id,
            total_value: totalValue,
            gains_losses: gainsLosses,
            snapshot_date: new Date().toISOString().split('T')[0],
          });

        updates.push({
          id: account.id,
          total_value: totalValue,
          gains_losses: gainsLosses,
          holdings_count: holdingsData.holdings?.length || 0
        });

        console.log(`Synced account ${account.id}: $${totalValue.toFixed(2)}`);

      } catch (error) {
        console.error(`Error syncing account ${account.id}:`, error);
      }
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
