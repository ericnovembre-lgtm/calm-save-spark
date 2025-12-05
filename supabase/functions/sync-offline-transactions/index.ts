import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  id: string;
  success: boolean;
  error?: string;
  transaction_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending queue items
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('offline_transaction_queue')
      .select('*')
      .eq('user_id', user.id)
      .in('sync_status', ['pending', 'failed'])
      .lt('retry_count', 5)
      .order('created_at', { ascending: true })
      .limit(50);

    if (queueError) {
      console.error('Error fetching queue:', queueError);
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, message: 'No pending transactions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} queued transactions for user ${user.id}`);

    const results: SyncResult[] = [];

    for (const item of queueItems) {
      try {
        // Mark as syncing
        await supabaseClient
          .from('offline_transaction_queue')
          .update({ sync_status: 'syncing' })
          .eq('id', item.id);

        const txData = item.transaction_data as {
          amount: number;
          merchant: string;
          category?: string;
          transaction_date: string;
          notes?: string;
        };

        // Check for duplicates (same amount, merchant, date within 1 minute)
        const { data: existing } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('amount', txData.amount)
          .eq('merchant', txData.merchant)
          .gte('transaction_date', new Date(new Date(txData.transaction_date).getTime() - 60000).toISOString())
          .lte('transaction_date', new Date(new Date(txData.transaction_date).getTime() + 60000).toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          console.log('Duplicate transaction detected, skipping:', item.id);
          
          await supabaseClient
            .from('offline_transaction_queue')
            .update({ 
              sync_status: 'synced',
              synced_at: new Date().toISOString(),
              error_message: 'Duplicate detected - already exists'
            })
            .eq('id', item.id);

          results.push({
            id: item.id,
            success: true,
            transaction_id: existing[0].id
          });
          continue;
        }

        // Insert transaction
        const { data: newTx, error: txError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: txData.amount,
            merchant: txData.merchant,
            category: txData.category || 'Uncategorized',
            transaction_date: txData.transaction_date,
            notes: txData.notes || 'Added via mobile offline sync'
          })
          .select('id')
          .single();

        if (txError) throw txError;

        // Mark as synced
        await supabaseClient
          .from('offline_transaction_queue')
          .update({ 
            sync_status: 'synced',
            synced_at: new Date().toISOString()
          })
          .eq('id', item.id);

        results.push({
          id: item.id,
          success: true,
          transaction_id: newTx.id
        });

      } catch (err) {
        console.error('Failed to sync transaction:', item.id, err);

        await supabaseClient
          .from('offline_transaction_queue')
          .update({ 
            sync_status: 'failed',
            retry_count: (item.retry_count || 0) + 1,
            error_message: err instanceof Error ? err.message : 'Unknown error'
          })
          .eq('id', item.id);

        results.push({
          id: item.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Sync complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: successCount,
        failed: failCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-offline-transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
