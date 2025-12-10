import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { captureEdgeException, trackEdgePerformance } from "../_shared/sentry-edge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline adaptive limiter and batch config
type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
type CircuitState = 'closed' | 'open' | 'half-open';

interface QuotaState {
  requestsRemainingRPD: number;
  requestsLimitRPD: number;
  tokensRemainingTPM: number;
  tokensLimitTPM: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  consecutiveFailures: number;
}

interface GroqQuotaInfo {
  requestsLimitRPD: number;
  requestsRemainingRPD: number;
  requestsResetRPD: string | null;
  tokensLimitTPM: number;
  tokensRemainingTPM: number;
  tokensResetTPM: string | null;
  retryAfter: string | null;
}

const GROQ_LIMITS = {
  REQUESTS_PER_DAY: 14400,
  TOKENS_PER_MINUTE: 6000,
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
};

const BATCH_CONFIG = {
  sizing: {
    low: { queueDepth: 5, batchSize: 5 },
    medium: { queueDepth: 20, batchSize: 10 },
    high: { queueDepth: 50, batchSize: 15 },
    peak: { queueDepth: Infinity, batchSize: 20 }
  },
  limits: { maxBatchSize: 20, maxTokensPerTransaction: 150 }
};

function calculateBatchSize(queueDepth: number, strategy: AdaptiveStrategy): number {
  const { sizing, limits } = BATCH_CONFIG;
  // Reduce batch size based on strategy
  const strategyMultiplier: Record<AdaptiveStrategy, number> = {
    aggressive: 1.0,
    moderate: 0.75,
    conservative: 0.5,
    critical: 0.25,
  };
  
  let baseBatchSize: number;
  if (queueDepth <= sizing.low.queueDepth) baseBatchSize = sizing.low.batchSize;
  else if (queueDepth <= sizing.medium.queueDepth) baseBatchSize = sizing.medium.batchSize;
  else if (queueDepth <= sizing.high.queueDepth) baseBatchSize = sizing.high.batchSize;
  else baseBatchSize = sizing.peak.batchSize;
  
  return Math.max(1, Math.min(Math.floor(baseBatchSize * strategyMultiplier[strategy]), limits.maxBatchSize));
}

function parseGroqHeaders(headers: Headers): GroqQuotaInfo {
  return {
    requestsLimitRPD: parseInt(headers.get('x-ratelimit-limit-requests') || String(GROQ_LIMITS.REQUESTS_PER_DAY)),
    requestsRemainingRPD: parseInt(headers.get('x-ratelimit-remaining-requests') || String(GROQ_LIMITS.REQUESTS_PER_DAY)),
    requestsResetRPD: headers.get('x-ratelimit-reset-requests'),
    tokensLimitTPM: parseInt(headers.get('x-ratelimit-limit-tokens') || String(GROQ_LIMITS.TOKENS_PER_MINUTE)),
    tokensRemainingTPM: parseInt(headers.get('x-ratelimit-remaining-tokens') || String(GROQ_LIMITS.TOKENS_PER_MINUTE)),
    tokensResetTPM: headers.get('x-ratelimit-reset-tokens'),
    retryAfter: headers.get('retry-after'),
  };
}

function calculateStrategy(state: QuotaState): AdaptiveStrategy {
  const requestsRatio = state.requestsRemainingRPD / state.requestsLimitRPD;
  const tokensRatio = state.tokensRemainingTPM / state.tokensLimitTPM;
  const minRatio = Math.min(requestsRatio, tokensRatio);
  if (minRatio > 0.7) return 'aggressive';
  if (minRatio > 0.3) return 'moderate';
  if (minRatio > 0.1) return 'conservative';
  return 'critical';
}

function getStrategyDelay(strategy: AdaptiveStrategy): number {
  const delays: Record<AdaptiveStrategy, number> = {
    aggressive: 0,
    moderate: 200,
    conservative: 1000,
    critical: 3000,
  };
  return delays[strategy];
}

async function getQuotaState(supabase: any): Promise<QuotaState> {
  const { data } = await supabase.from('groq_quota_state').select('*').limit(1).single();
  if (!data) {
    return {
      requestsRemainingRPD: GROQ_LIMITS.REQUESTS_PER_DAY,
      requestsLimitRPD: GROQ_LIMITS.REQUESTS_PER_DAY,
      tokensRemainingTPM: GROQ_LIMITS.TOKENS_PER_MINUTE,
      tokensLimitTPM: GROQ_LIMITS.TOKENS_PER_MINUTE,
      circuitState: 'closed',
      circuitOpenedAt: null,
      consecutiveFailures: 0,
    };
  }
  return {
    requestsRemainingRPD: data.requests_remaining_rpd,
    requestsLimitRPD: data.requests_limit_rpd,
    tokensRemainingTPM: data.tokens_remaining_tpm,
    tokensLimitTPM: data.tokens_limit_tpm,
    circuitState: data.circuit_state,
    circuitOpenedAt: data.circuit_opened_at,
    consecutiveFailures: data.consecutive_failures,
  };
}

async function updateQuotaState(supabase: any, info: GroqQuotaInfo, latencyMs: number, success: boolean) {
  await supabase.rpc('update_groq_quota_state', {
    p_requests_remaining: info.requestsRemainingRPD,
    p_requests_limit: info.requestsLimitRPD,
    p_requests_reset: info.requestsResetRPD ? new Date(info.requestsResetRPD).toISOString() : null,
    p_tokens_remaining: info.tokensRemainingTPM,
    p_tokens_limit: info.tokensLimitTPM,
    p_tokens_reset: info.tokensResetTPM ? new Date(info.tokensResetTPM).toISOString() : null,
    p_latency_ms: latencyMs,
    p_success: success,
  });
}

async function updateCircuitState(supabase: any, state: CircuitState) {
  await supabase.rpc('update_groq_circuit_state', { p_state: state });
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

async function analyzeTransactionBatch(
  supabase: any,
  transactions: { alert: AlertRecord; avgSpend: number }[]
): Promise<{ results: BatchAnalysisResult[]; latencyMs: number; strategy: AdaptiveStrategy }> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

  // Get quota state and check circuit breaker
  const quotaState = await getQuotaState(supabase);
  
  if (quotaState.circuitState === 'open') {
    const openedAt = quotaState.circuitOpenedAt ? new Date(quotaState.circuitOpenedAt).getTime() : 0;
    if (Date.now() - openedAt < GROQ_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS) {
      throw new Error('CIRCUIT_OPEN: Rate limit protection active');
    }
    await updateCircuitState(supabase, 'half-open');
  }

  const strategy = calculateStrategy(quotaState);
  const delay = getStrategyDelay(strategy);
  
  console.log(`[BatchProcess] Strategy: ${strategy}, Delay: ${delay}ms, Batch size: ${transactions.length}`);
  
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

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

Return ONLY a valid JSON array:
[{"index":0,"isAnomaly":false,"alertType":"normal","riskLevel":"low","message":"Within normal spending","confidence":0.95}, ...]`;

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
  const quotaInfo = parseGroqHeaders(response.headers);
  
  console.log(`[BatchProcess] Groq API: ${response.status}, ${latencyMs}ms, tokens remaining: ${quotaInfo.tokensRemainingTPM}`);

  if (!response.ok) {
    await updateQuotaState(supabase, quotaInfo, latencyMs, false);
    if (response.status === 429) {
      await updateCircuitState(supabase, 'open');
      throw new Error('RATE_LIMITED: Groq API rate limit hit');
    }
    throw new Error(`Groq API error: ${response.status}`);
  }

  await updateQuotaState(supabase, quotaInfo, latencyMs, true);
  
  if (quotaState.circuitState !== 'closed') {
    await updateCircuitState(supabase, 'closed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    
    const results: BatchAnalysisResult[] = JSON.parse(jsonMatch[0]);
    return {
      results: results.map((r, i) => ({
        index: r.index ?? i,
        isAnomaly: r.isAnomaly ?? false,
        alertType: r.alertType || 'normal',
        riskLevel: r.riskLevel || 'low',
        message: r.message || 'No anomaly detected',
        confidence: r.confidence ?? 0.5
      })),
      latencyMs,
      strategy
    };
  } catch {
    console.error('[BatchProcess] Failed to parse response:', content);
    return {
      results: transactions.map((_, i) => ({
        index: i,
        isAnomaly: false,
        alertType: 'normal',
        riskLevel: 'low',
        message: 'Analysis unavailable',
        confidence: 0.0
      })),
      latencyMs,
      strategy
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const totalStartTime = Date.now();
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    console.log(`[BatchProcess] Starting batch ${batchId}`);

    // Get quota state to determine batch sizing
    const quotaState = await getQuotaState(supabase);
    const strategy = calculateStrategy(quotaState);

    const { count: queueDepth } = await supabase
      .from('transaction_alert_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const actualQueueDepth = queueDepth || 0;
    const batchSize = calculateBatchSize(actualQueueDepth, strategy);

    console.log(`[BatchProcess] Queue: ${actualQueueDepth}, Strategy: ${strategy}, Batch size: ${batchSize}`);

    const { data: pendingAlerts, error: fetchError } = await supabase
      .from('transaction_alert_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) throw fetchError;

    if (!pendingAlerts || pendingAlerts.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending alerts', batchId, strategy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alertIds = pendingAlerts.map(a => a.id);
    await supabase.from('transaction_alert_queue').update({ status: 'processing' }).in('id', alertIds);

    // Get user contexts
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
        userContexts.set(userId, 50);
      }
    }

    const batchTransactions = pendingAlerts.map(alert => ({
      alert: alert as AlertRecord,
      avgSpend: userContexts.get(alert.user_id) || 50
    }));

    const { results: analysisResults, latencyMs: groqLatencyMs, strategy: usedStrategy } = 
      await analyzeTransactionBatch(supabase, batchTransactions);

    const results = [];
    let anomaliesDetected = 0;

    for (let i = 0; i < pendingAlerts.length; i++) {
      const alert = pendingAlerts[i];
      const analysis = analysisResults.find(r => r.index === i) || analysisResults[i];
      const txData = alert.transaction_data as TransactionData;

      try {
        if (analysis.isAnomaly) {
          anomaliesDetected++;
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
              alert_type: analysis.alertType,
              risk_level: analysis.riskLevel,
              confidence: analysis.confidence,
              batch_id: batchId,
              strategy: usedStrategy,
              model: 'groq-batch'
            }
          });

          await supabase.from('notification_queue').insert({
            user_id: alert.user_id,
            notification_type: 'transaction_anomaly',
            subject: `⚠️ ${txData.merchant}`,
            content: {
              title: `Unusual Transaction: ${txData.merchant}`,
              body: analysis.message,
              data: { type: 'transaction_anomaly', transactionId: txData.id, riskLevel: analysis.riskLevel, batchId, strategy: usedStrategy }
            },
            status: 'pending'
          });
        }

        await supabase.from('transaction_alert_queue')
          .update({ status: 'completed', processed_at: new Date().toISOString() })
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
        await supabase.from('transaction_alert_queue')
          .update({ status: 'failed', error_message: itemError instanceof Error ? itemError.message : 'Unknown', processed_at: new Date().toISOString() })
          .eq('id', alert.id);
      }
    }

    const totalProcessingMs = Date.now() - totalStartTime;

    await supabase.from('batch_processing_analytics').insert({
      batch_id: batchId,
      queue_depth: actualQueueDepth,
      batch_size: batchSize,
      transactions_processed: results.length,
      anomalies_detected: anomaliesDetected,
      groq_latency_ms: groqLatencyMs,
      total_processing_ms: totalProcessingMs,
      tokens_used: pendingAlerts.length * 100
    });

    console.log(`[BatchProcess] Completed ${batchId}: ${results.length} processed, ${anomaliesDetected} anomalies, ${groqLatencyMs}ms, strategy: ${usedStrategy}`);

    return new Response(
      JSON.stringify({ batchId, processed: results.length, anomaliesDetected, groqLatencyMs, totalProcessingMs, strategy: usedStrategy, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BatchProcess] Fatal error:', error);
    
    // Capture error to Sentry with batch processing context
    await captureEdgeException(error, {
      tags: { 
        function: 'batch-process-alerts',
        batch_id: batchId
      },
      extra: { 
        processing_time_ms: Date.now() - totalStartTime,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
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
