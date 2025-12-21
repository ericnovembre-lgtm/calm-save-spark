import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inline adaptive limiter (Deno Deploy can't import from _shared)
type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
type CircuitState = 'closed' | 'open' | 'half-open';

interface QuotaState {
  requestsRemainingRPD: number;
  requestsLimitRPD: number;
  tokensRemainingTPM: number;
  tokensLimitTPM: number;
  avgLatencyMs: number;
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
  MAX_CONSECUTIVE_FAILURES: 3,
};

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
    moderate: 100,
    conservative: 500,
    critical: 2000,
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
      avgLatencyMs: 0,
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
    avgLatencyMs: data.avg_latency_ms,
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

interface TransactionAlert {
  isAnomaly: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  alertType: string | null;
  message: string;
  category?: string;
  latencyMs: number;
  strategy: AdaptiveStrategy;
}

async function analyzeWithGroq(
  supabase: any,
  transaction: { merchant: string; amount: number; category?: string; timestamp: string },
  userContext: { averageSpend: number; monthlyBudget: number; usualCategories: string[]; recentTransactionCount: number }
): Promise<TransactionAlert> {
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
  
  console.log(`[InstantAlert] Strategy: ${strategy}, Delay: ${delay}ms`);
  
  if (delay > 0) await new Promise(r => setTimeout(r, delay));

  const systemPrompt = `You are a real-time transaction monitor. Analyze transactions for anomalies and generate instant alerts. Respond with ONLY valid JSON.

Detect:
- Unusual amounts (much higher than user average)
- Suspicious merchants (unusual patterns)
- Budget warnings (approaching limits)
- Duplicate charges (same merchant/amount recently)
- Time anomalies (unusual purchase time)`;

  const userPrompt = `Analyze this transaction:
Merchant: ${transaction.merchant}
Amount: $${transaction.amount}
Category: ${transaction.category || 'Unknown'}
Time: ${transaction.timestamp}

User Profile:
- Average spend: $${userContext.averageSpend}
- Monthly budget: $${userContext.monthlyBudget}
- Usual categories: ${userContext.usualCategories.join(', ')}
- Recent transactions: ${userContext.recentTransactionCount}

Return ONLY: {"isAnomaly":false,"riskLevel":"low","alertType":null,"message":"Normal transaction","category":"suggested_category"}
Or if anomaly: {"isAnomaly":true,"riskLevel":"high","alertType":"unusual_amount","message":"⚠️ Alert: This $${transaction.amount} charge is 3x your average spend","category":"suggested_category"}`;

  const startTime = Date.now();
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.1
    }),
  });

  const latencyMs = Date.now() - startTime;
  const quotaInfo = parseGroqHeaders(response.headers);

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
  const content = data.choices[0].message.content;
  
  console.log(`[InstantAlert] Groq response in ${latencyMs}ms, strategy: ${strategy}`);
  
  try {
    const parsed = JSON.parse(content);
    return { ...parsed, latencyMs, strategy };
  } catch {
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, latencyMs, strategy };
    }
    return {
      isAnomaly: false,
      riskLevel: 'low',
      alertType: null,
      message: 'Transaction processed',
      latencyMs,
      strategy
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction, userId } = await req.json();
    if (!transaction || !userId) throw new Error('Missing transaction or userId');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('amount, category, merchant')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString())
      .order('date', { ascending: false })
      .limit(100);

    const amounts = recentTransactions?.map(t => Math.abs(t.amount)) || [];
    const averageSpend = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 50;
    const usualCategories = [...new Set(recentTransactions?.map(t => t.category).filter(Boolean) || [])];
    
    const { data: budgets } = await supabase
      .from('user_budgets')
      .select('total_limit')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    const monthlyBudget = budgets?.reduce((sum, b) => sum + (b.total_limit || 0), 0) || 2000;

    const userContext = {
      averageSpend: Math.round(averageSpend * 100) / 100,
      monthlyBudget,
      usualCategories: usualCategories.slice(0, 5),
      recentTransactionCount: recentTransactions?.length || 0
    };

    const alert = await analyzeWithGroq(supabase, transaction, userContext);

    await supabase.from('ai_model_routing_analytics').insert({
      user_id: userId,
      query_type: 'speed_critical',
      model_used: 'groq-instant',
      response_time_ms: alert.latencyMs,
      confidence_score: alert.isAnomaly ? 0.95 : 0.8,
      query_length: JSON.stringify(transaction).length
    });

    if (alert.isAnomaly) {
      await supabase.from('wallet_notifications').insert({
        user_id: userId,
        notification_type: 'transaction_alert',
        title: `⚠️ ${alert.alertType === 'unusual_amount' ? 'Unusual Transaction' : 'Transaction Alert'}: ${transaction.merchant}`,
        message: alert.message,
        priority: alert.riskLevel,
        read: false,
        metadata: {
          transaction_amount: transaction.amount,
          merchant: transaction.merchant,
          alert_type: alert.alertType,
          risk_level: alert.riskLevel,
          latency_ms: alert.latencyMs,
          strategy: alert.strategy,
          model: 'groq-instant'
        }
      });

      await supabase.from('notification_queue').insert({
        user_id: userId,
        notification_type: 'transaction_anomaly',
        subject: `⚠️ ${transaction.merchant}`,
        content: {
          title: `Unusual Transaction: ${transaction.merchant}`,
          body: alert.message,
          data: {
            type: 'transaction_anomaly',
            riskLevel: alert.riskLevel,
            strategy: alert.strategy,
            model: 'groq-instant',
            latencyMs: alert.latencyMs
          }
        },
        status: 'pending'
      });
    }

    return new Response(
      JSON.stringify({
        ...alert,
        userContext: { averageSpend: userContext.averageSpend, monthlyBudget: userContext.monthlyBudget }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in instant-transaction-alert:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
