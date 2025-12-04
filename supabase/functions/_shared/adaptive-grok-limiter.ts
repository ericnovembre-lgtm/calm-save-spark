/**
 * Adaptive Rate Limiter for xAI Grok API
 * Automatically scales API usage based on remaining quota and response times
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Grok API limits (estimated - xAI doesn't publish exact limits)
const GROK_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  TOKENS_PER_MINUTE: 100000,
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
  MAX_CONSECUTIVE_FAILURES: 3,
  COST_PER_REQUEST: 0.15, // Estimated cost per request
};

export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface GrokQuotaInfo {
  requestsLimitRPM: number;
  requestsRemainingRPM: number;
  requestsResetRPM: string | null;
  tokensLimitTPM: number;
  tokensRemainingTPM: number;
  tokensResetTPM: string | null;
  retryAfter: string | null;
}

export interface QuotaState {
  requestsRemainingRPM: number;
  requestsLimitRPM: number;
  tokensRemainingTPM: number;
  tokensLimitTPM: number;
  avgLatencyMs: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  consecutiveFailures: number;
}

export interface AdaptiveConfig {
  delayMs: number;
  skipRateLimitCheck: boolean;
}

/**
 * Parse Grok rate limit headers from response
 */
export function parseGrokRateLimitHeaders(headers: Headers): GrokQuotaInfo {
  return {
    requestsLimitRPM: parseInt(headers.get('x-ratelimit-limit-requests') || String(GROK_LIMITS.REQUESTS_PER_MINUTE)),
    requestsRemainingRPM: parseInt(headers.get('x-ratelimit-remaining-requests') || String(GROK_LIMITS.REQUESTS_PER_MINUTE)),
    requestsResetRPM: headers.get('x-ratelimit-reset-requests'),
    tokensLimitTPM: parseInt(headers.get('x-ratelimit-limit-tokens') || String(GROK_LIMITS.TOKENS_PER_MINUTE)),
    tokensRemainingTPM: parseInt(headers.get('x-ratelimit-remaining-tokens') || String(GROK_LIMITS.TOKENS_PER_MINUTE)),
    tokensResetTPM: headers.get('x-ratelimit-reset-tokens'),
    retryAfter: headers.get('retry-after'),
  };
}

/**
 * Calculate adaptive strategy based on quota state
 */
export function calculateAdaptiveStrategy(quotaState: QuotaState): AdaptiveStrategy {
  const requestsRatio = quotaState.requestsRemainingRPM / quotaState.requestsLimitRPM;
  const tokensRatio = quotaState.tokensRemainingTPM / quotaState.tokensLimitTPM;
  const minRatio = Math.min(requestsRatio, tokensRatio);

  if (minRatio > 0.7) return 'aggressive';
  if (minRatio > 0.3) return 'moderate';
  if (minRatio > 0.1) return 'conservative';
  return 'critical';
}

/**
 * Get adaptive config based on strategy
 */
export function getAdaptiveConfig(strategy: AdaptiveStrategy): AdaptiveConfig {
  const configs: Record<AdaptiveStrategy, AdaptiveConfig> = {
    aggressive: { delayMs: 0, skipRateLimitCheck: false },
    moderate: { delayMs: 100, skipRateLimitCheck: false },
    conservative: { delayMs: 500, skipRateLimitCheck: false },
    critical: { delayMs: 2000, skipRateLimitCheck: true },
  };
  return configs[strategy];
}

/**
 * Check if circuit breaker should open
 */
export function shouldOpenCircuit(state: QuotaState): boolean {
  return (
    state.consecutiveFailures >= GROK_LIMITS.MAX_CONSECUTIVE_FAILURES ||
    state.tokensRemainingTPM < 100 ||
    state.requestsRemainingRPM < 5
  );
}

/**
 * Check if circuit breaker can transition to half-open
 */
export function canTryHalfOpen(state: QuotaState): boolean {
  if (state.circuitState !== 'open' || !state.circuitOpenedAt) return false;
  const openedAt = new Date(state.circuitOpenedAt).getTime();
  return Date.now() - openedAt >= GROK_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS;
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
    .from('grok_quota_state')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return {
      requestsRemainingRPM: GROK_LIMITS.REQUESTS_PER_MINUTE,
      requestsLimitRPM: GROK_LIMITS.REQUESTS_PER_MINUTE,
      tokensRemainingTPM: GROK_LIMITS.TOKENS_PER_MINUTE,
      tokensLimitTPM: GROK_LIMITS.TOKENS_PER_MINUTE,
      avgLatencyMs: 0,
      circuitState: 'closed',
      circuitOpenedAt: null,
      consecutiveFailures: 0,
    };
  }

  return {
    requestsRemainingRPM: data.requests_remaining_rpm,
    requestsLimitRPM: data.requests_limit_rpm,
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
  quotaInfo: GrokQuotaInfo,
  latencyMs: number,
  success: boolean,
  isSentiment: boolean = true
): Promise<void> {
  await supabase.rpc('update_grok_quota_state', {
    p_requests_remaining: quotaInfo.requestsRemainingRPM,
    p_requests_limit: quotaInfo.requestsLimitRPM,
    p_requests_reset: quotaInfo.requestsResetRPM ? new Date(quotaInfo.requestsResetRPM).toISOString() : null,
    p_tokens_remaining: quotaInfo.tokensRemainingTPM,
    p_tokens_limit: quotaInfo.tokensLimitTPM,
    p_tokens_reset: quotaInfo.tokensResetTPM ? new Date(quotaInfo.tokensResetTPM).toISOString() : null,
    p_latency_ms: latencyMs,
    p_success: success,
    p_is_sentiment: isSentiment,
  });
}

/**
 * Update circuit breaker state
 */
export async function updateCircuitState(supabase: SupabaseClient, state: CircuitState): Promise<void> {
  await supabase.rpc('update_grok_circuit_state', { p_state: state });
}

export interface GrokRequestOptions {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

export interface AdaptiveGrokResult {
  data: any;
  quotaInfo: GrokQuotaInfo;
  latencyMs: number;
  strategy: AdaptiveStrategy;
}

/**
 * Main wrapper: Call Grok API with adaptive rate limiting
 */
export async function callGrokWithAdaptiveLimit(
  supabase: SupabaseClient,
  options: GrokRequestOptions,
  isSentiment: boolean = true
): Promise<AdaptiveGrokResult> {
  const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY not configured');
  }

  // 1. Get current quota state
  const quotaState = await getQuotaState(supabase);
  
  // 2. Check circuit breaker
  if (quotaState.circuitState === 'open') {
    if (canTryHalfOpen(quotaState)) {
      console.log('[GrokLimiter] Circuit transitioning to half-open');
      await updateCircuitState(supabase, 'half-open');
    } else {
      const waitMs = GROK_LIMITS.CIRCUIT_BREAKER_TIMEOUT_MS - 
        (Date.now() - new Date(quotaState.circuitOpenedAt!).getTime());
      throw new Error(`CIRCUIT_OPEN: Rate limit protection active. Retry in ${Math.ceil(waitMs / 1000)}s`);
    }
  }

  // 3. Calculate adaptive strategy
  const strategy = calculateAdaptiveStrategy(quotaState);
  const config = getAdaptiveConfig(strategy);
  
  console.log(`[GrokLimiter] Strategy: ${strategy}, Delay: ${config.delayMs}ms, ` +
    `Requests remaining: ${quotaState.requestsRemainingRPM}/${quotaState.requestsLimitRPM}`);

  // 4. Apply delay if needed
  if (config.delayMs > 0) {
    await sleep(config.delayMs);
  }

  // 5. Make API call
  const startTime = Date.now();
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'grok-3-fast',
      messages: options.messages,
      max_tokens: options.max_tokens || 500,
      temperature: options.temperature ?? 0.7,
    }),
  });
  
  const latencyMs = Date.now() - startTime;

  // 6. Parse rate limit headers
  const quotaInfo = parseGrokRateLimitHeaders(response.headers);
  
  console.log(`[GrokLimiter] Response: ${response.status}, Latency: ${latencyMs}ms, ` +
    `Tokens remaining: ${quotaInfo.tokensRemainingTPM}/${quotaInfo.tokensLimitTPM}`);

  // 7. Handle errors with circuit breaker
  if (!response.ok) {
    await updateQuotaState(supabase, quotaInfo, latencyMs, false, isSentiment);
    
    if (response.status === 429) {
      console.error('[GrokLimiter] Rate limited - opening circuit breaker');
      await updateCircuitState(supabase, 'open');
      const retryAfter = quotaInfo.retryAfter || '60';
      throw new Error(`RATE_LIMITED: Grok API rate limit hit. Retry after ${retryAfter}s`);
    }
    
    if (shouldOpenCircuit({ ...quotaState, consecutiveFailures: quotaState.consecutiveFailures + 1 })) {
      console.error('[GrokLimiter] Too many failures - opening circuit breaker');
      await updateCircuitState(supabase, 'open');
    }
    
    throw new Error(`Grok API error: ${response.status}`);
  }

  // 8. Update quota state on success
  await updateQuotaState(supabase, quotaInfo, latencyMs, true, isSentiment);

  // 9. Reset circuit on success
  if (quotaState.circuitState !== 'closed') {
    console.log('[GrokLimiter] Request succeeded - closing circuit breaker');
    await updateCircuitState(supabase, 'closed');
  }

  const data = await response.json();
  return { data, quotaInfo, latencyMs, strategy };
}
