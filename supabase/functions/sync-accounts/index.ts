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

    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');

    let totalTransactionsSynced = 0;

    // Sync each account with Plaid
    for (const account of accounts || []) {
      if (!account.plaid_access_token) {
        console.log(`Skipping account ${account.id} - no Plaid token`);
        continue;
      }

      console.log(`Syncing account ${account.id}`);

      try {
        // Get transactions from last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();

        const transactionsResponse = await fetch(`https://${plaidEnv}.plaid.com/transactions/get`, {
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
          // Insert new transactions
          const transactionsToInsert = transactionsData.transactions.map((t: any) => ({
            user_id: user.id,
            account_id: account.id,
            amount: Math.abs(t.amount),
            transaction_date: t.date,
            merchant: t.merchant_name || t.name,
            description: t.name,
            category: t.category?.[0] || 'other',
            is_recurring: t.payment_channel === 'recurring',
          }));

          // Use upsert to avoid duplicates (assuming Plaid transaction_id as unique)
          await supabaseClient
            .from('transactions')
            .upsert(transactionsToInsert, { onConflict: 'transaction_date,merchant,amount' });

          totalTransactionsSynced += transactionsToInsert.length;
        }

        // Update account balance
        const balanceResponse = await fetch(`https://${plaidEnv}.plaid.com/accounts/balance/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: plaidClientId,
            secret: plaidSecret,
            access_token: account.plaid_access_token,
          }),
        });

        const balanceData = await balanceResponse.json();

        if (balanceResponse.ok && balanceData.accounts) {
          const plaidAccount = balanceData.accounts.find((a: any) => a.account_id === account.plaid_account_id);
          if (plaidAccount) {
            await supabaseClient
              .from('connected_accounts')
              .update({ 
                balance: plaidAccount.balances.current,
                available_balance: plaidAccount.balances.available,
                current_balance: plaidAccount.balances.current,
                last_synced: new Date().toISOString(),
              })
              .eq('id', account.id);
          }
        }
      } catch (error) {
        console.error(`Error syncing account ${account.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Accounts synced successfully',
        accounts_synced: accounts?.length || 0,
        transactions_synced: totalTransactionsSynced,
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
