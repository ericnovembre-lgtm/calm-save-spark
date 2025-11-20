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

    const { account_id } = await req.json();

    // Get the specific account if account_id provided, otherwise get all active accounts
    let accountsQuery = supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_status', 'active');

    if (account_id) {
      accountsQuery = accountsQuery.eq('id', account_id);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;
    if (accountsError) throw accountsError;

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found to sync');
    }

    const plaidEnv = (Deno.env.get('PLAID_ENV') || 'sandbox').toLowerCase().replace(/[\s\-]/g, '').trim();
    const validEnvs = ['sandbox', 'development', 'production'];
    const finalPlaidEnv = validEnvs.includes(plaidEnv) ? plaidEnv : 'sandbox';
    
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');

    if (!plaidClientId || !plaidSecret) {
      throw new Error('Plaid credentials not configured');
    }

    let totalTransactionsSynced = 0;
    const syncResults = [];

    // Sync each account
    for (const account of accounts) {
      if (!account.plaid_access_token) {
        console.log(`Skipping account ${account.id} - no Plaid token`);
        syncResults.push({ account_id: account.id, status: 'skipped', reason: 'no_token' });
        continue;
      }

      console.log(`Syncing account ${account.id} (${account.institution_name})`);

      try {
        // Get transactions from last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();

        const transactionsResponse = await fetch(`https://${finalPlaidEnv}.plaid.com/transactions/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: plaidClientId,
            secret: plaidSecret,
            access_token: account.plaid_access_token,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
          }),
        });

        const transactionsData = await transactionsResponse.json();

        if (transactionsResponse.ok && transactionsData.transactions) {
          // Filter transactions for this specific account
          const accountTransactions = transactionsData.transactions.filter(
            (t: any) => t.account_id === account.plaid_account_id
          );

          console.log(`Found ${accountTransactions.length} transactions for account ${account.id}`);

          // Insert transactions
          if (accountTransactions.length > 0) {
            const transactionsToInsert = accountTransactions.map((t: any) => ({
              user_id: user.id,
              account_id: account.id,
              plaid_transaction_id: t.transaction_id,
              amount: Math.abs(t.amount),
              transaction_date: t.date,
              merchant: t.merchant_name || t.name,
              description: t.name,
              category: t.category?.[0] || 'other',
              is_recurring: t.payment_channel === 'recurring',
            }));

            const { error: txError } = await supabaseClient
              .from('transactions')
              .upsert(transactionsToInsert, { 
                onConflict: 'plaid_transaction_id',
                ignoreDuplicates: false 
              });

            if (txError) {
              console.error(`Error inserting transactions for account ${account.id}:`, txError);
            } else {
              totalTransactionsSynced += accountTransactions.length;
              syncResults.push({ 
                account_id: account.id, 
                status: 'success', 
                transactions_synced: accountTransactions.length 
              });
            }
          } else {
            syncResults.push({ account_id: account.id, status: 'success', transactions_synced: 0 });
          }
        } else {
          console.error(`Plaid API error for account ${account.id}:`, transactionsData);
          syncResults.push({ 
            account_id: account.id, 
            status: 'error', 
            error: transactionsData.error_message || 'Plaid API error' 
          });
        }

        // Update account balance
        const balanceResponse = await fetch(`https://${finalPlaidEnv}.plaid.com/accounts/balance/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: plaidClientId,
            secret: plaidSecret,
            access_token: account.plaid_access_token,
            options: { account_ids: [account.plaid_account_id] }
          }),
        });

        const balanceData = await balanceResponse.json();

        if (balanceResponse.ok && balanceData.accounts?.[0]) {
          const plaidAccount = balanceData.accounts[0];
          await supabaseClient
            .from('connected_accounts')
            .update({ 
              balance: plaidAccount.balances.current,
              available_balance: plaidAccount.balances.available,
              current_balance: plaidAccount.balances.current,
              last_synced: new Date().toISOString(),
            })
            .eq('id', account.id);
          
          console.log(`Updated balance for account ${account.id}`);
        }
      } catch (error) {
        console.error(`Error syncing account ${account.id}:`, error);
        syncResults.push({ 
          account_id: account.id, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account sync completed',
        accounts_synced: accounts.length,
        transactions_synced: totalTransactionsSynced,
        results: syncResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-plaid-transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
