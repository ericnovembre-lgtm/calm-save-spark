import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline batch config (can't import from _shared in Deno Deploy)
const BATCH_CONFIG = {
  sizing: {
    low: { queueDepth: 5, batchSize: 5 },
    medium: { queueDepth: 20, batchSize: 10 },
    high: { queueDepth: 50, batchSize: 15 },
    peak: { queueDepth: Infinity, batchSize: 20 }
  },
  throttle: {
    baseDelayMs: 100,
    maxDelayMs: 2000,
    latencyThresholdMs: 500,
    backoffMultiplier: 1.5
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000
  },
  limits: {
    maxBatchSize: 20,
    maxTokensPerTransaction: 150,
    maxTotalTokens: 3000
  }
};

function calculateBatchSize(queueDepth: number): number {
  const { sizing, limits } = BATCH_CONFIG;
  if (queueDepth <= sizing.low.queueDepth) return sizing.low.batchSize;
  if (queueDepth <= sizing.medium.queueDepth) return sizing.medium.batchSize;
  if (queueDepth <= sizing.high.queueDepth) return sizing.high.batchSize;
  return Math.min(sizing.peak.batchSize, limits.maxBatchSize);
}

function calculateThrottleDelay(previousLatencyMs: number): number {
  const { throttle } = BATCH_CONFIG;
  if (previousLatencyMs <= throttle.latencyThresholdMs) return throttle.baseDelayMs;
  const overageRatio = previousLatencyMs / throttle.latencyThresholdMs;
  return Math.min(throttle.baseDelayMs * overageRatio * throttle.backoffMultiplier, throttle.maxDelayMs);
}

interface TransactionData {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  transaction_date: string;
}

interface AlertRecord {
  id: string;
  user_id: string;
  transaction_data: TransactionData;
}

interface BatchAnalysisResult {
  index: number;
  isAnomaly: boolean;
  alertType: string;
  riskLevel: string;
  message: string;
  confidence: number;
}

/**
 * Analyze multiple transactions in a single Groq API call
 */
async function analyzeTransactionBatch(
  transactions: { alert: AlertRecord; avgSpend: number }[]
): Promise<BatchAnalysisResult[]> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const batchPrompt = `You are a financial anomaly detection system. Analyze these ${transactions.length} transactions and return a JSON array with analysis for each.

TRANSACTIONS:
${transactions.map((tx, i) => `
[${i}] Merchant: "${tx.alert.transaction_data.merchant}"
     Amount: $${Math.abs(tx.alert.transaction_data.amount).toFixed(2)}
     Category: ${tx.alert.transaction_data.category || 'unknown'}
     User's avg spend in category: $${tx.avgSpend.toFixed(2)}
`).join('')}

For each transaction, determine:
1. isAnomaly: true if amount is >2x the user's average OR merchant seems suspicious
2. alertType: "unusual_amount" | "unusual_merchant" | "unusual_time" | "normal"
3. riskLevel: "low" | "medium" | "high"
4. message: Brief explanation (max 100 chars)
5. confidence: 0.0 to 1.0

Return ONLY a valid JSON array with objects matching this structure:
[{"index":0,"isAnomaly":false,"alertType":"normal","riskLevel":"low","message":"Within normal spending","confidence":0.95}, ...]

JSON array:`;

  const startTime = Date.now();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: batchPrompt }],
      max_tokens: transactions.length * BATCH_CONFIG.limits.maxTokensPerTransaction,
      temperature: 0.1,
    }),
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[BatchProcess] Groq API latency: ${latencyMs}ms for ${transactions.length} transactions`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[BatchProcess] Groq API error:', errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  try {
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const results: BatchAnalysisResult[] = JSON.parse(jsonMatch[0]);
    
    // Validate and fill in missing fields
    return results.map((r, i) => ({
      index: r.index ?? i,
      isAnomaly: r.isAnomaly ?? false,
      alertType: r.alertType || 'normal',
      riskLevel: r.riskLevel || 'low',
      message: r.message || 'No anomaly detected',
      confidence: r.confidence ?? 0.5
    }));
  } catch (parseError) {
    console.error('[BatchProcess] Failed to parse Groq response:', content);
    // Return default results for all transactions
    return transactions.map((_, i) => ({
      index: i,
      isAnomaly: false,
      alertType: 'normal',
      riskLevel: 'low',
      message: 'Analysis unavailable - defaulting to normal',
      confidence: 0.0
    }));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const totalStartTime = Date.now();
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    console.log(`[BatchProcess] Starting batch processing - ID: ${batchId}`);

    // Get queue depth
    const { count: queueDepth } = await supabase
      .from('transaction_alert_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const actualQueueDepth = queueDepth || 0;
    const batchSize = calculateBatchSize(actualQueueDepth);

    console.log(`[BatchProcess] Queue depth: ${actualQueueDepth}, Batch size: ${batchSize}`);

    // Fetch batch of pending alerts
    const { data: pendingAlerts, error: fetchError } = await supabase
      .from('transaction_alert_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingAlerts || pendingAlerts.length === 0) {
      console.log('[BatchProcess] No pending alerts');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending alerts', batchId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark all as processing
    const alertIds = pendingAlerts.map(a => a.id);
    await supabase
      .from('transaction_alert_queue')
      .update({ status: 'processing' })
      .in('id', alertIds);

    // Get user context (average spending) for each user
    const userIds = [...new Set(pendingAlerts.map(a => a.user_id))];
    const userContexts = new Map<string, number>();

    for (const userId of userIds) {
      const { data: recentTx } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .lt('amount', 0)
        .order('transaction_date', { ascending: false })
        .limit(50);
      
      if (recentTx && recentTx.length > 0) {
        const avgSpend = recentTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / recentTx.length;
        userContexts.set(userId, avgSpend);
      } else {
        userContexts.set(userId, 50); // Default average
      }
    }

    // Prepare batch for analysis
    const batchTransactions = pendingAlerts.map(alert => ({
      alert: alert as AlertRecord,
      avgSpend: userContexts.get(alert.user_id) || 50
    }));

    // Analyze entire batch in single API call
    const groqStartTime = Date.now();
    const analysisResults = await analyzeTransactionBatch(batchTransactions);
    const groqLatencyMs = Date.now() - groqStartTime;

    // Process results
    const results = [];
    let anomaliesDetected = 0;

    for (let i = 0; i < pendingAlerts.length; i++) {
      const alert = pendingAlerts[i];
      const analysis = analysisResults.find(r => r.index === i) || analysisResults[i];
      const txData = alert.transaction_data as TransactionData;

      try {
        if (analysis.isAnomaly) {
          anomaliesDetected++;

          // Create notification
          await supabase.from('wallet_notifications').insert({
            user_id: alert.user_id,
            notification_type: 'transaction_alert',
            title: `⚠️ ${analysis.alertType === 'unusual_amount' ? 'Unusual Transaction' : 'Transaction Alert'}`,
            message: analysis.message,
            priority: analysis.riskLevel,
            read: false,
            metadata: {
              transaction_id: txData.id,
              merchant: txData.merchant,
              amount: txData.amount,
              category: txData.category,
              alert_type: analysis.alertType,
              risk_level: analysis.riskLevel,
              confidence: analysis.confidence,
              batch_id: batchId,
              model: 'groq-batch'
            }
          });

          // Queue push notification
          await supabase.from('notification_queue').insert({
            user_id: alert.user_id,
            notification_type: 'transaction_anomaly',
            subject: `⚠️ ${txData.merchant}`,
            content: {
              title: `Unusual Transaction: ${txData.merchant}`,
              body: analysis.message,
              data: {
                type: 'transaction_anomaly',
                transactionId: txData.id,
                riskLevel: analysis.riskLevel,
                batchId,
                model: 'groq-batch'
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
          transactionId: txData.id,
          isAnomaly: analysis.isAnomaly,
          riskLevel: analysis.riskLevel,
          confidence: analysis.confidence
        });

      } catch (itemError) {
        console.error(`[BatchProcess] Error processing item ${i}:`, itemError);
        
        await supabase
          .from('transaction_alert_queue')
          .update({ 
            status: 'failed',
            error_message: itemError instanceof Error ? itemError.message : 'Unknown error',
            processed_at: new Date().toISOString()
          })
          .eq('id', alert.id);
      }
    }

    const totalProcessingMs = Date.now() - totalStartTime;

    // Log batch analytics
    await supabase.from('batch_processing_analytics').insert({
      batch_id: batchId,
      queue_depth: actualQueueDepth,
      batch_size: batchSize,
      transactions_processed: results.length,
      anomalies_detected: anomaliesDetected,
      groq_latency_ms: groqLatencyMs,
      total_processing_ms: totalProcessingMs,
      tokens_used: pendingAlerts.length * 100 // Estimate
    });

    console.log(`[BatchProcess] Completed batch ${batchId}: ${results.length} processed, ${anomaliesDetected} anomalies, ${groqLatencyMs}ms Groq latency`);

    return new Response(
      JSON.stringify({
        batchId,
        processed: results.length,
        anomaliesDetected,
        groqLatencyMs,
        totalProcessingMs,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BatchProcess] Fatal error:', error);

    // Log failed batch
    await supabase.from('batch_processing_analytics').insert({
      batch_id: batchId,
      queue_depth: 0,
      batch_size: 0,
      transactions_processed: 0,
      anomalies_detected: 0,
      groq_latency_ms: 0,
      total_processing_ms: Date.now() - totalStartTime,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', batchId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
