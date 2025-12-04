/**
 * Adaptive Deepseek Rate Limiter with Circuit Breaker
 * Similar to Groq implementation for resilient API handling
 */

import { callDeepseek, DEEPSEEK_MODELS, estimateDeepseekCost } from "./deepseek-client.ts";

// Types
export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepseekOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface QuotaState {
  requestsRemaining: number;
  requestsLimit: number;
  tokensRemaining: number;
  tokensLimit: number;
  avgLatency: number;
  consecutiveFailures: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  reasoningTokensUsed: number;
  totalCostEstimate: number;
}

// Configuration
const CONFIG = {
  circuitBreaker: {
    failureThreshold: 3,
    recoveryTimeMs: 60000, // 60 seconds
    halfOpenTestCount: 1,
  },
  throttle: {
    aggressive: 0,
    moderate: 100,
    conservative: 500,
    critical: 2000,
  },
  quotaThresholds: {
    aggressive: 0.7, // >70% remaining
    moderate: 0.3,   // 30-70% remaining
    conservative: 0.1, // 10-30% remaining
    critical: 0,     // <10% remaining
  }
};

/**
 * Parse rate limit headers from Deepseek response
 */
export function parseDeepseekRateLimitHeaders(headers: Headers): Partial<QuotaState> {
  return {
    requestsRemaining: parseInt(headers.get('X-RateLimit-Remaining-Requests') || '60', 10),
    requestsLimit: parseInt(headers.get('X-RateLimit-Limit-Requests') || '60', 10),
    tokensRemaining: parseInt(headers.get('X-RateLimit-Remaining-Tokens') || '1000000', 10),
    tokensLimit: parseInt(headers.get('X-RateLimit-Limit-Tokens') || '1000000', 10),
  };
}

/**
 * Calculate adaptive strategy based on quota usage
 */
export function calculateStrategy(requestsRatio: number, tokensRatio: number): AdaptiveStrategy {
  const ratio = Math.min(requestsRatio, tokensRatio);
  
  if (ratio > CONFIG.quotaThresholds.aggressive) return 'aggressive';
  if (ratio > CONFIG.quotaThresholds.moderate) return 'moderate';
  if (ratio > CONFIG.quotaThresholds.conservative) return 'conservative';
  return 'critical';
}

/**
 * Get current quota state from database
 */
async function getQuotaState(supabaseClient: any): Promise<QuotaState> {
  const { data, error } = await supabaseClient
    .from('deepseek_quota_state')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('[Deepseek Limiter] Failed to get quota state:', error);
    return {
      requestsRemaining: 60,
      requestsLimit: 60,
      tokensRemaining: 1000000,
      tokensLimit: 1000000,
      avgLatency: 0,
      consecutiveFailures: 0,
      circuitState: 'closed',
      circuitOpenedAt: null,
      reasoningTokensUsed: 0,
      totalCostEstimate: 0,
    };
  }

  return {
    requestsRemaining: data.requests_remaining_rpm || 60,
    requestsLimit: data.requests_limit_rpm || 60,
    tokensRemaining: data.tokens_remaining_tpm || 1000000,
    tokensLimit: data.tokens_limit_tpm || 1000000,
    avgLatency: data.avg_latency_ms || 0,
    consecutiveFailures: data.consecutive_failures || 0,
    circuitState: (data.circuit_state as CircuitState) || 'closed',
    circuitOpenedAt: data.circuit_opened_at,
    reasoningTokensUsed: data.reasoning_tokens_used || 0,
    totalCostEstimate: parseFloat(data.total_cost_estimate) || 0,
  };
}

/**
 * Update quota state in database
 */
async function updateQuotaState(
  supabaseClient: any,
  quotaUpdate: Partial<QuotaState>,
  latencyMs: number,
  success: boolean,
  reasoningTokens: number = 0,
  costEstimate: number = 0
): Promise<void> {
  try {
    await supabaseClient.rpc('update_deepseek_quota_state', {
      p_requests_remaining: quotaUpdate.requestsRemaining || null,
      p_requests_limit: quotaUpdate.requestsLimit || null,
      p_requests_reset: null,
      p_tokens_remaining: quotaUpdate.tokensRemaining || null,
      p_tokens_limit: quotaUpdate.tokensLimit || null,
      p_tokens_reset: null,
      p_reasoning_tokens: reasoningTokens,
      p_latency_ms: latencyMs,
      p_success: success,
      p_cost_estimate: costEstimate,
    });
  } catch (error) {
    console.error('[Deepseek Limiter] Failed to update quota state:', error);
  }
}

/**
 * Update circuit breaker state
 */
async function updateCircuitState(supabaseClient: any, state: CircuitState): Promise<void> {
  try {
    await supabaseClient.rpc('update_deepseek_circuit_state', { p_state: state });
  } catch (error) {
    console.error('[Deepseek Limiter] Failed to update circuit state:', error);
  }
}

/**
 * Check if circuit breaker allows request
 */
function shouldAllowRequest(quotaState: QuotaState): { allowed: boolean; reason?: string } {
  if (quotaState.circuitState === 'open') {
    const openedAt = quotaState.circuitOpenedAt ? new Date(quotaState.circuitOpenedAt).getTime() : 0;
    const timeSinceOpen = Date.now() - openedAt;
    
    if (timeSinceOpen < CONFIG.circuitBreaker.recoveryTimeMs) {
      return { allowed: false, reason: 'Circuit breaker open' };
    }
    // Time to test recovery
    return { allowed: true, reason: 'Testing half-open state' };
  }

  if (quotaState.requestsRemaining < 5) {
    return { allowed: false, reason: 'Request quota near limit' };
  }

  if (quotaState.tokensRemaining < 1000) {
    return { allowed: false, reason: 'Token quota near limit' };
  }

  return { allowed: true };
}

/**
 * Main wrapper function with adaptive rate limiting and circuit breaker
 */
export async function callDeepseekWithAdaptiveLimit(
  messages: Message[],
  options: DeepseekOptions = {},
  supabaseClient: any
): Promise<any> {
  const quotaState = await getQuotaState(supabaseClient);
  
  // Check circuit breaker
  const { allowed, reason } = shouldAllowRequest(quotaState);
  if (!allowed) {
    console.warn('[Deepseek Limiter] Request blocked:', reason);
    throw new Error(`Deepseek API temporarily unavailable: ${reason}`);
  }

  // Calculate strategy and apply throttle
  const requestsRatio = quotaState.requestsRemaining / quotaState.requestsLimit;
  const tokensRatio = quotaState.tokensRemaining / quotaState.tokensLimit;
  const strategy = calculateStrategy(requestsRatio, tokensRatio);
  
  const throttleDelay = CONFIG.throttle[strategy];
  if (throttleDelay > 0) {
    console.log(`[Deepseek Limiter] Applying ${strategy} throttle: ${throttleDelay}ms`);
    await new Promise(resolve => setTimeout(resolve, throttleDelay));
  }

  const startTime = Date.now();
  
  try {
    const response = await callDeepseek(messages, {
      maxTokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.1,
    });

    const latencyMs = Date.now() - startTime;
    const reasoningTokens = response.usage?.reasoning_tokens || 0;
    const costEstimate = estimateDeepseekCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      reasoningTokens
    );

    // Update quota state on success
    await updateQuotaState(
      supabaseClient,
      {},
      latencyMs,
      true,
      reasoningTokens,
      costEstimate
    );

    // Close circuit on successful request
    if (quotaState.circuitState === 'half-open') {
      await updateCircuitState(supabaseClient, 'closed');
      console.log('[Deepseek Limiter] Circuit closed after successful test');
    }

    return response;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Update quota state on failure
    await updateQuotaState(supabaseClient, {}, latencyMs, false, 0, 0);

    // Check if we need to open circuit breaker
    const newFailures = quotaState.consecutiveFailures + 1;
    if (newFailures >= CONFIG.circuitBreaker.failureThreshold) {
      await updateCircuitState(supabaseClient, 'open');
      console.error('[Deepseek Limiter] Circuit breaker opened after', newFailures, 'failures');
    }

    throw error;
  }
}

/**
 * Get current Deepseek quota status for monitoring
 */
export async function getDeepseekQuotaStatus(supabaseClient: any): Promise<QuotaState & { strategy: AdaptiveStrategy }> {
  const state = await getQuotaState(supabaseClient);
  const requestsRatio = state.requestsRemaining / state.requestsLimit;
  const tokensRatio = state.tokensRemaining / state.tokensLimit;
  const strategy = calculateStrategy(requestsRatio, tokensRatio);
  
  return { ...state, strategy };
}
