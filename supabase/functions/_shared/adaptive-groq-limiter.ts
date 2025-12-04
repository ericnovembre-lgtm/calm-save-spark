/**
 * Adaptive Rate Limiter for Groq API
 * Automatically scales API usage based on remaining quota and response times
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Groq API limits
const GROQ_LIMITS = {
  REQUESTS_PER_DAY: 14400,
  TOKENS_PER_MINUTE: 6000,
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
  MAX_CONSECUTIVE_FAILURES: 3,
};

export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface GroqQuotaInfo {
  requestsLimitRPD: number;
  requestsRemainingRPD: number;
  requestsResetRPD: string | null;
  tokensLimitTPM: number;
  tokensRemainingTPM: number;
  tokensResetTPM: string | null;
  retryAfter: string | null;
}

export interface QuotaState {
  requestsRemainingRPD: number;
  requestsLimitRPD: number;
  tokensRemainingTPM: number;
  tokensLimitTPM: number;
  avgLatencyMs: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  consecutiveFailures: number;
}

export interface AdaptiveConfig {
  delayMs: number;
  maxBatchSize: number;
  skipRateLimitCheck: boolean;
}

/**
 * Parse Groq rate limit headers from response
 */
export function parseGroqRateLimitHeaders(headers: Headers): GroqQuotaInfo {
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

/**
 * Calculate adaptive strategy based on quota state
 */
export function calculateAdaptiveStrategy(quotaState: QuotaState): AdaptiveStrategy {
  const requestsRatio = quotaState.requestsRemainingRPD / quotaState.requestsLimitRPD;
  const tokensRatio = quotaState.tokensRemainingTPM / quotaState.tokensLimitTPM;
  const minRatio = Math.min(requestsRatio, tokensRatio);

  if (minRatio > 0.7) return 'aggressive';      // >70% quota: fast processing
  if (minRatio > 0.3) return 'moderate';        // 30-70%: balanced
  if (minRatio > 0.1) return 'conservative';    // 10-30%: slow down
  return 'critical';                             // <10%: circuit breaker
}

/**
 * Get adaptive config based on strategy
 */
export function getAdaptiveConfig(strategy: AdaptiveStrategy): AdaptiveConfig {
  const configs: Record<AdaptiveStrategy, AdaptiveConfig> = {
    aggressive: { delayMs: 0, maxBatchSize: 20, skipRateLimitCheck: false },
    moderate: { delayMs: 100, maxBatchSize: 15, skipRateLimitCheck: false },
    conservative: { delayMs: 500, maxBatchSize: 10, skipRateLimitCheck: false },
    critical: { delayMs: 2000, maxBatchSize: 5, skipRateLimitCheck: true },
  };
  return configs[strategy];
}

/**
 * Check if circuit breaker should open
 */
export function shouldOpenCircuit(state: QuotaState): boolean {
  return (
    state.consecutiveFailures >= GROQ_LIMITS.MAX_CONSECUTIVE_FAILURES ||
    state.tokensRemainingTPM < 100 ||
    state.requestsRemainingRPD < 10
  );
}

/**
 * Check if circuit breaker can transition to half-open
 */
export function canTryHalfOpen(state: QuotaState): boolean {
  if (state.circuitState !== 'open' || !state.circuitOpenedAt) return false;
  const openedAt = new Date(state.circuitOpenedAt).getTime();
  return Date.now() - openedAt >= GROQ_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current quota state from database
 */
export async function getQuotaState(supabase: SupabaseClient): Promise<QuotaState> {
  const { data, error } = await supabase
    .from('groq_quota_state')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    // Return defaults if no state exists
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
    circuitState: data.circuit_state as CircuitState,
    circuitOpenedAt: data.circuit_opened_at,
    consecutiveFailures: data.consecutive_failures,
  };
}

/**
 * Update quota state in database after API call
 */
export async function updateQuotaState(
  supabase: SupabaseClient,
  quotaInfo: GroqQuotaInfo,
  latencyMs: number,
  success: boolean
): Promise<void> {
  await supabase.rpc('update_groq_quota_state', {
    p_requests_remaining: quotaInfo.requestsRemainingRPD,
    p_requests_limit: quotaInfo.requestsLimitRPD,
    p_requests_reset: quotaInfo.requestsResetRPD ? new Date(quotaInfo.requestsResetRPD).toISOString() : null,
    p_tokens_remaining: quotaInfo.tokensRemainingTPM,
    p_tokens_limit: quotaInfo.tokensLimitTPM,
    p_tokens_reset: quotaInfo.tokensResetTPM ? new Date(quotaInfo.tokensResetTPM).toISOString() : null,
    p_latency_ms: latencyMs,
    p_success: success,
  });
}

/**
 * Update circuit breaker state
 */
export async function updateCircuitState(supabase: SupabaseClient, state: CircuitState): Promise<void> {
  await supabase.rpc('update_groq_circuit_state', { p_state: state });
}

export interface GroqRequestOptions {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

export interface AdaptiveGroqResult {
  data: any;
  quotaInfo: GroqQuotaInfo;
  latencyMs: number;
  strategy: AdaptiveStrategy;
}

/**
 * Main wrapper: Call Groq API with adaptive rate limiting
 */
export async function callGroqWithAdaptiveLimit(
  supabase: SupabaseClient,
  options: GroqRequestOptions
): Promise<AdaptiveGroqResult> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  // 1. Get current quota state
  const quotaState = await getQuotaState(supabase);
  
  // 2. Check circuit breaker
  if (quotaState.circuitState === 'open') {
    if (canTryHalfOpen(quotaState)) {
      console.log('[AdaptiveLimiter] Circuit transitioning to half-open');
      await updateCircuitState(supabase, 'half-open');
    } else {
      const waitMs = GROQ_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS - 
        (Date.now() - new Date(quotaState.circuitOpenedAt!).getTime());
      throw new Error(`CIRCUIT_OPEN: Rate limit protection active. Retry in ${Math.ceil(waitMs / 1000)}s`);
    }
  }

  // 3. Calculate adaptive strategy
  const strategy = calculateAdaptiveStrategy(quotaState);
  const config = getAdaptiveConfig(strategy);
  
  console.log(`[AdaptiveLimiter] Strategy: ${strategy}, Delay: ${config.delayMs}ms, ` +
    `Requests remaining: ${quotaState.requestsRemainingRPD}/${quotaState.requestsLimitRPD}`);

  // 4. Apply delay if needed
  if (config.delayMs > 0) {
    await sleep(config.delayMs);
  }

  // 5. Make API call
  const startTime = Date.now();
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'llama-3.1-8b-instant',
      messages: options.messages,
      max_tokens: options.max_tokens || 300,
      temperature: options.temperature ?? 0.1,
    }),
  });
  
  const latencyMs = Date.now() - startTime;

  // 6. Parse rate limit headers
  const quotaInfo = parseGroqRateLimitHeaders(response.headers);
  
  console.log(`[AdaptiveLimiter] Response: ${response.status}, Latency: ${latencyMs}ms, ` +
    `Tokens remaining: ${quotaInfo.tokensRemainingTPM}/${quotaInfo.tokensLimitTPM}`);

  // 7. Handle errors with circuit breaker
  if (!response.ok) {
    await updateQuotaState(supabase, quotaInfo, latencyMs, false);
    
    if (response.status === 429) {
      console.error('[AdaptiveLimiter] Rate limited - opening circuit breaker');
      await updateCircuitState(supabase, 'open');
      const retryAfter = quotaInfo.retryAfter || '60';
      throw new Error(`RATE_LIMITED: Groq API rate limit hit. Retry after ${retryAfter}s`);
    }
    
    // Check if we should open circuit due to failures
    if (shouldOpenCircuit({ ...quotaState, consecutiveFailures: quotaState.consecutiveFailures + 1 })) {
      console.error('[AdaptiveLimiter] Too many failures - opening circuit breaker');
      await updateCircuitState(supabase, 'open');
    }
    
    throw new Error(`Groq API error: ${response.status}`);
  }

  // 8. Update quota state on success
  await updateQuotaState(supabase, quotaInfo, latencyMs, true);

  // 9. Reset circuit on success
  if (quotaState.circuitState !== 'closed') {
    console.log('[AdaptiveLimiter] Request succeeded - closing circuit breaker');
    await updateCircuitState(supabase, 'closed');
  }

  const data = await response.json();
  return { data, quotaInfo, latencyMs, strategy };
}
