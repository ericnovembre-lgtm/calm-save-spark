/**
 * Smart Batching Configuration
 * Optimizes Groq API usage during high-volume transaction processing
 */

export const BATCH_CONFIG = {
  // Dynamic sizing thresholds
  sizing: {
    low: { queueDepth: 5, batchSize: 5 },
    medium: { queueDepth: 20, batchSize: 10 },
    high: { queueDepth: 50, batchSize: 15 },
    peak: { queueDepth: Infinity, batchSize: 20 }
  },
  
  // Throttling configuration
  throttle: {
    baseDelayMs: 100,
    maxDelayMs: 2000,
    latencyThresholdMs: 500, // Increase delay if latency exceeds this
    backoffMultiplier: 1.5
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000
  },
  
  // Limits
  limits: {
    maxBatchSize: 20,
    maxTokensPerTransaction: 150,
    maxTotalTokens: 3000,
    singleProcessingThreshold: 3 // Use single processing if queue depth <= this
  }
};

/**
 * Calculate optimal batch size based on current queue depth
 */
export function calculateBatchSize(queueDepth: number): number {
  const { sizing, limits } = BATCH_CONFIG;
  
  if (queueDepth <= sizing.low.queueDepth) {
    return sizing.low.batchSize;
  }
  if (queueDepth <= sizing.medium.queueDepth) {
    return sizing.medium.batchSize;
  }
  if (queueDepth <= sizing.high.queueDepth) {
    return sizing.high.batchSize;
  }
  return Math.min(sizing.peak.batchSize, limits.maxBatchSize);
}

/**
 * Calculate throttle delay based on previous latency
 */
export function calculateThrottleDelay(previousLatencyMs: number): number {
  const { throttle } = BATCH_CONFIG;
  
  if (previousLatencyMs <= throttle.latencyThresholdMs) {
    return throttle.baseDelayMs;
  }
  
  // Increase delay proportionally to latency overage
  const overageRatio = previousLatencyMs / throttle.latencyThresholdMs;
  const delay = throttle.baseDelayMs * overageRatio * throttle.backoffMultiplier;
  
  return Math.min(delay, throttle.maxDelayMs);
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(attemptNumber: number): number {
  const { retry } = BATCH_CONFIG;
  const delay = retry.baseDelayMs * Math.pow(2, attemptNumber - 1);
  return Math.min(delay, retry.maxDelayMs);
}

/**
 * Determine if batch processing should be used
 */
export function shouldUseBatchProcessing(queueDepth: number): boolean {
  return queueDepth > BATCH_CONFIG.limits.singleProcessingThreshold;
}

/**
 * Generate unique batch ID
 */
export function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
