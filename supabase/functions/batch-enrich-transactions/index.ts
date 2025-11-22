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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find transactions needing enrichment
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, merchant')
      .contains('enrichment_metadata', { needs_enrichment: true })
      .is('enrichment_metadata->ai_cleaned', null)
      .limit(100);

    if (fetchError) throw fetchError;

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No transactions need enrichment', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${transactions.length} transactions to enrich`);

    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (tx) => {
          if (!tx.merchant) return;

          try {
            // Call enrichment function
            const { data, error } = await supabase.functions.invoke('enrich-transaction', {
              body: { transactionId: tx.id, rawMerchant: tx.merchant }
            });

            if (error) throw error;
            return data;
          } catch (error) {
            console.error(`Failed to enrich transaction ${tx.id}:`, error);
            throw error;
          }
        })
      );

      processed += batch.length;
      successful += results.filter(r => r.status === 'fulfilled').length;
      failed += results.filter(r => r.status === 'rejected').length;

      // Small delay between batches to respect rate limits
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      message: 'Batch enrichment completed',
      processed,
      successful,
      failed,
      timestamp: new Date().toISOString(),
    };

    console.log('Batch enrichment summary:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in batch-enrich-transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});