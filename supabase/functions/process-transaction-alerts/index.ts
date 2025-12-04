import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Threshold for switching to batch processing
const BATCH_THRESHOLD = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  try {
    console.log('[ProcessAlerts] Starting queue processing...');

    // Check queue depth to determine processing mode
    const { count: queueDepth } = await supabase
      .from('transaction_alert_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const actualQueueDepth = queueDepth || 0;
    console.log(`[ProcessAlerts] Queue depth: ${actualQueueDepth}`);

    // Use batch processing for high volume
    if (actualQueueDepth > BATCH_THRESHOLD) {
      console.log(`[ProcessAlerts] Queue depth ${actualQueueDepth} > ${BATCH_THRESHOLD}, using batch processing`);
      
      const batchResponse = await supabase.functions.invoke('batch-process-alerts');
      
      if (batchResponse.error) {
        console.error('[ProcessAlerts] Batch processing error:', batchResponse.error);
        throw new Error(batchResponse.error.message || 'Batch processing failed');
      }

      return new Response(
        JSON.stringify({ 
          mode: 'batch',
          ...batchResponse.data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single processing mode for low volume
    console.log(`[ProcessAlerts] Queue depth ${actualQueueDepth} <= ${BATCH_THRESHOLD}, using single processing`);

    // Fetch pending alerts from queue
    const { data: pendingAlerts, error: fetchError } = await supabase
      .from('transaction_alert_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('[ProcessAlerts] Fetch error:', fetchError);
      throw fetchError;
    }

    if (!pendingAlerts || pendingAlerts.length === 0) {
      console.log('[ProcessAlerts] No pending alerts to process');
      return new Response(
        JSON.stringify({ mode: 'single', processed: 0, message: 'No pending alerts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ProcessAlerts] Processing ${pendingAlerts.length} alerts in single mode`);

    const results = [];

    for (const alert of pendingAlerts) {
      try {
        // Mark as processing
        await supabase
          .from('transaction_alert_queue')
          .update({ status: 'processing' })
          .eq('id', alert.id);

        const transactionData = alert.transaction_data as {
          id: string;
          merchant: string;
          amount: number;
          category: string;
          transaction_date: string;
        };

        // Call instant-transaction-alert for Groq analysis
        const alertResponse = await supabase.functions.invoke('instant-transaction-alert', {
          body: {
            transaction: {
              merchant: transactionData.merchant,
              amount: Math.abs(transactionData.amount),
              category: transactionData.category,
              timestamp: transactionData.transaction_date
            },
            userId: alert.user_id
          }
        });

        if (alertResponse.error) {
          throw new Error(alertResponse.error.message || 'Alert function error');
        }

        const analysisResult = alertResponse.data;
        console.log(`[ProcessAlerts] Analysis result for ${transactionData.merchant}:`, analysisResult);

        // If anomaly detected, create wallet notification and queue push
        if (analysisResult.isAnomaly) {
          // Insert wallet notification for real-time delivery
          const { data: notification, error: notifError } = await supabase
            .from('wallet_notifications')
            .insert({
              user_id: alert.user_id,
              notification_type: 'transaction_alert',
              title: `⚠️ ${analysisResult.alertType === 'unusual_amount' ? 'Unusual Transaction' : 'Transaction Alert'}`,
              message: analysisResult.message,
              priority: analysisResult.riskLevel,
              read: false,
              metadata: {
                transaction_id: transactionData.id,
                merchant: transactionData.merchant,
                amount: transactionData.amount,
                category: transactionData.category,
                alert_type: analysisResult.alertType,
                risk_level: analysisResult.riskLevel,
                latency_ms: analysisResult.latencyMs,
                model: 'groq-instant'
              }
            })
            .select()
            .single();

          if (notifError) {
            console.error('[ProcessAlerts] Notification insert error:', notifError);
          } else {
            console.log(`[ProcessAlerts] Created notification ${notification?.id}`);
          }

          // Queue push notification
          await supabase.from('notification_queue').insert({
            user_id: alert.user_id,
            notification_type: 'transaction_anomaly',
            subject: `⚠️ ${transactionData.merchant}`,
            content: {
              title: `Unusual Transaction: ${transactionData.merchant}`,
              body: analysisResult.message,
              data: {
                type: 'transaction_anomaly',
                transactionId: transactionData.id,
                riskLevel: analysisResult.riskLevel,
                model: 'groq-instant',
                latencyMs: analysisResult.latencyMs
              }
            },
            status: 'pending'
          });
        }

        // Mark as completed
        await supabase
          .from('transaction_alert_queue')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        results.push({
          alertId: alert.id,
          transactionId: transactionData.id,
          isAnomaly: analysisResult.isAnomaly,
          riskLevel: analysisResult.riskLevel,
          latencyMs: analysisResult.latencyMs
        });

      } catch (alertError) {
        console.error(`[ProcessAlerts] Error processing alert ${alert.id}:`, alertError);
        
        // Mark as failed
        await supabase
          .from('transaction_alert_queue')
          .update({ 
            status: 'failed',
            error_message: alertError instanceof Error ? alertError.message : 'Unknown error',
            processed_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        results.push({
          alertId: alert.id,
          error: alertError instanceof Error ? alertError.message : 'Unknown error'
        });
      }
    }

    console.log(`[ProcessAlerts] Completed processing ${results.length} alerts in single mode`);

    return new Response(
      JSON.stringify({ 
        mode: 'single',
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ProcessAlerts] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
