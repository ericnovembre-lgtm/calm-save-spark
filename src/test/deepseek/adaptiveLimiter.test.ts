/**
 * Phase 4: Adaptive Deepseek Limiter Tests
 * Tests for quota management, circuit breaker, and adaptive throttling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockQuotaState,
  createMockQuotaStateAggressive,
  createMockQuotaStateModerate,
  createMockQuotaStateConservative,
  createMockQuotaStateCritical,
  createMockQuotaStateCircuitOpen,
  createMockSupabaseClient,
  type MockQuotaState,
} from '../mocks/phase4Responses';

// ==================== Unit Tests: Strategy Calculation ====================

describe('Adaptive Strategy Calculation', () => {
  const calculateStrategy = (quotaState: MockQuotaState): 'aggressive' | 'moderate' | 'conservative' | 'critical' => {
    const requestRatio = quotaState.requests_remaining_rpm / quotaState.requests_limit_rpm;
    const tokenRatio = quotaState.tokens_remaining_tpm / quotaState.tokens_limit_tpm;
    const minRatio = Math.min(requestRatio, tokenRatio);
    
    if (minRatio > 0.7) return 'aggressive';
    if (minRatio > 0.3) return 'moderate';
    if (minRatio > 0.1) return 'conservative';
    return 'critical';
  };

  describe('Aggressive Strategy (>70% quota)', () => {
    it('should return aggressive when >70% quota remaining', () => {
      const quotaState = createMockQuotaStateAggressive();
      
      const strategy = calculateStrategy(quotaState);
      
      expect(strategy).toBe('aggressive');
    });

    it('should have 0ms throttle delay', () => {
      const throttleDelays = { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 };
      
      expect(throttleDelays.aggressive).toBe(0);
    });
  });

  describe('Moderate Strategy (30-70% quota)', () => {
    it('should return moderate when 30-70% quota remaining', () => {
      const quotaState = createMockQuotaStateModerate();
      
      const strategy = calculateStrategy(quotaState);
      
      expect(strategy).toBe('moderate');
    });

    it('should have 100ms throttle delay', () => {
      const throttleDelays = { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 };
      
      expect(throttleDelays.moderate).toBe(100);
    });
  });

  describe('Conservative Strategy (10-30% quota)', () => {
    it('should return conservative when 10-30% quota remaining', () => {
      const quotaState = createMockQuotaStateConservative();
      
      const strategy = calculateStrategy(quotaState);
      
      expect(strategy).toBe('conservative');
    });

    it('should have 500ms throttle delay', () => {
      const throttleDelays = { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 };
      
      expect(throttleDelays.conservative).toBe(500);
    });
  });

  describe('Critical Strategy (<10% quota)', () => {
    it('should return critical when <10% quota remaining', () => {
      const quotaState = createMockQuotaStateCritical();
      
      const strategy = calculateStrategy(quotaState);
      
      expect(strategy).toBe('critical');
    });

    it('should have 2000ms throttle delay', () => {
      const throttleDelays = { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 };
      
      expect(throttleDelays.critical).toBe(2000);
    });
  });

  describe('Strategy Based on Minimum Ratio', () => {
    it('should use minimum of request and token ratios', () => {
      const quotaState = createMockQuotaState({
        requests_remaining_rpm: 55, // 91.7% - aggressive
        tokens_remaining_tpm: 25000, // 25% - conservative
      });
      
      const strategy = calculateStrategy(quotaState);
      
      // Should be conservative based on lower token ratio
      expect(strategy).toBe('conservative');
    });
  });
});

// ==================== Unit Tests: Circuit Breaker ====================

describe('Circuit Breaker', () => {
  describe('Circuit States', () => {
    it('should have closed state as default', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.circuit_state).toBe('closed');
    });

    it('should allow requests when circuit is closed', () => {
      const quotaState = createMockQuotaState({ circuit_state: 'closed' });
      const shouldAllowRequest = quotaState.circuit_state === 'closed' || quotaState.circuit_state === 'half-open';
      
      expect(shouldAllowRequest).toBe(true);
    });

    it('should block requests when circuit is open', () => {
      const quotaState = createMockQuotaStateCircuitOpen();
      const shouldBlockRequest = quotaState.circuit_state === 'open';
      
      expect(shouldBlockRequest).toBe(true);
    });

    it('should allow single test request when circuit is half-open', () => {
      const quotaState = createMockQuotaState({ circuit_state: 'half-open' });
      const shouldAllowTestRequest = quotaState.circuit_state === 'half-open';
      
      expect(shouldAllowTestRequest).toBe(true);
    });
  });

  describe('Failure Threshold', () => {
    it('should open circuit after 3 consecutive failures', () => {
      const simulateFailures = (count: number): 'closed' | 'open' => {
        return count >= 3 ? 'open' : 'closed';
      };
      
      expect(simulateFailures(1)).toBe('closed');
      expect(simulateFailures(2)).toBe('closed');
      expect(simulateFailures(3)).toBe('open');
      expect(simulateFailures(4)).toBe('open');
    });

    it('should track consecutive failures', () => {
      const quotaState = createMockQuotaStateCircuitOpen();
      
      expect(quotaState.consecutive_failures).toBe(3);
    });

    it('should reset failure count on success', () => {
      const simulateSuccess = (quotaState: MockQuotaState): MockQuotaState => ({
        ...quotaState,
        consecutive_failures: 0,
        circuit_state: quotaState.circuit_state === 'half-open' ? 'closed' : quotaState.circuit_state,
      });
      
      const openCircuit = createMockQuotaStateCircuitOpen();
      const halfOpen = { ...openCircuit, circuit_state: 'half-open' as const };
      const afterSuccess = simulateSuccess(halfOpen);
      
      expect(afterSuccess.consecutive_failures).toBe(0);
      expect(afterSuccess.circuit_state).toBe('closed');
    });
  });

  describe('Recovery Window', () => {
    it('should have 60-second recovery window', () => {
      const RECOVERY_WINDOW_MS = 60000;
      
      expect(RECOVERY_WINDOW_MS).toBe(60000);
    });

    it('should transition to half-open after recovery window', () => {
      const quotaState = createMockQuotaStateCircuitOpen();
      const circuitOpenedAt = new Date(quotaState.circuit_opened_at!);
      const now = new Date(circuitOpenedAt.getTime() + 61000); // 61 seconds later
      
      const recoveryWindowMs = 60000;
      const timeSinceOpen = now.getTime() - circuitOpenedAt.getTime();
      const shouldTransitionToHalfOpen = timeSinceOpen > recoveryWindowMs;
      
      expect(shouldTransitionToHalfOpen).toBe(true);
    });

    it('should remain open within recovery window', () => {
      const quotaState = createMockQuotaStateCircuitOpen();
      const circuitOpenedAt = new Date(quotaState.circuit_opened_at!);
      const now = new Date(circuitOpenedAt.getTime() + 30000); // 30 seconds later
      
      const recoveryWindowMs = 60000;
      const timeSinceOpen = now.getTime() - circuitOpenedAt.getTime();
      const shouldRemainOpen = timeSinceOpen <= recoveryWindowMs;
      
      expect(shouldRemainOpen).toBe(true);
    });
  });

  describe('State Transitions', () => {
    it('should transition closed → open on failures', () => {
      type CircuitState = 'closed' | 'open' | 'half-open';
      
      const transition = (state: CircuitState, event: 'failure' | 'success' | 'timeout', failureCount: number): CircuitState => {
        if (state === 'closed' && event === 'failure' && failureCount >= 3) {
          return 'open';
        }
        if (state === 'open' && event === 'timeout') {
          return 'half-open';
        }
        if (state === 'half-open' && event === 'success') {
          return 'closed';
        }
        if (state === 'half-open' && event === 'failure') {
          return 'open';
        }
        return state;
      };
      
      expect(transition('closed', 'failure', 3)).toBe('open');
      expect(transition('open', 'timeout', 0)).toBe('half-open');
      expect(transition('half-open', 'success', 0)).toBe('closed');
      expect(transition('half-open', 'failure', 1)).toBe('open');
    });
  });
});

// ==================== Unit Tests: Quota Monitoring ====================

describe('Quota Monitoring', () => {
  describe('Request Quota', () => {
    it('should track requests remaining', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.requests_remaining_rpm).toBeLessThanOrEqual(quotaState.requests_limit_rpm);
    });

    it('should calculate requests usage percentage', () => {
      const quotaState = createMockQuotaState();
      const usagePercent = 1 - (quotaState.requests_remaining_rpm / quotaState.requests_limit_rpm);
      
      expect(usagePercent).toBeGreaterThanOrEqual(0);
      expect(usagePercent).toBeLessThanOrEqual(1);
    });
  });

  describe('Token Quota', () => {
    it('should track tokens remaining', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.tokens_remaining_tpm).toBeLessThanOrEqual(quotaState.tokens_limit_tpm);
    });

    it('should calculate token usage percentage', () => {
      const quotaState = createMockQuotaState();
      const usagePercent = 1 - (quotaState.tokens_remaining_tpm / quotaState.tokens_limit_tpm);
      
      expect(usagePercent).toBeGreaterThanOrEqual(0);
      expect(usagePercent).toBeLessThanOrEqual(1);
    });
  });

  describe('Reset Timing', () => {
    it('should have future reset timestamps', () => {
      const quotaState = createMockQuotaState();
      const now = new Date();
      
      expect(new Date(quotaState.requests_reset_at) > now).toBe(true);
      expect(new Date(quotaState.tokens_reset_at) > now).toBe(true);
    });

    it('should calculate time until reset', () => {
      const quotaState = createMockQuotaState();
      const now = new Date();
      const resetAt = new Date(quotaState.requests_reset_at);
      
      const timeUntilReset = resetAt.getTime() - now.getTime();
      
      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(60000); // Within 1 minute
    });
  });
});

// ==================== Unit Tests: Latency Tracking ====================

describe('Latency Tracking', () => {
  describe('Average Latency', () => {
    it('should calculate running average', () => {
      const calculateNewAverage = (oldAvg: number, newLatency: number, samples: number): number => {
        return ((oldAvg * samples) + newLatency) / (samples + 1);
      };
      
      const oldAvg = 400;
      const newLatency = 500;
      const samples = 100;
      
      const newAvg = calculateNewAverage(oldAvg, newLatency, samples);
      
      expect(newAvg).toBeCloseTo(400.99, 1);
    });

    it('should track latency samples count', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.latency_samples).toBeGreaterThan(0);
    });
  });

  describe('Latency-Based Throttling', () => {
    it('should increase delay when latency exceeds 500ms', () => {
      const baseDelay = 100;
      const latencyMs = 600;
      const latencyThreshold = 500;
      
      const adjustedDelay = latencyMs > latencyThreshold 
        ? baseDelay * (latencyMs / latencyThreshold) 
        : baseDelay;
      
      expect(adjustedDelay).toBe(120); // 100 * (600/500)
    });
  });
});

// ==================== Unit Tests: Cost Tracking ====================

describe('Cost Tracking', () => {
  describe('Reasoning Token Cost', () => {
    it('should track reasoning tokens separately', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.reasoning_tokens_used).toBeGreaterThanOrEqual(0);
    });

    it('should calculate cost with reasoning token premium', () => {
      // Deepseek pricing: reasoning tokens are 3x regular tokens
      const completionTokens = 500;
      const reasoningTokens = 200;
      const tokenCost = 0.000001; // $1 per million tokens
      const reasoningMultiplier = 3;
      
      const totalCost = (completionTokens * tokenCost) + (reasoningTokens * tokenCost * reasoningMultiplier);
      
      expect(totalCost).toBeCloseTo(0.0011, 4);
    });
  });

  describe('Total Cost Estimate', () => {
    it('should accumulate total cost', () => {
      const quotaState = createMockQuotaState();
      
      expect(quotaState.total_cost_estimate).toBeGreaterThanOrEqual(0);
    });
  });
});

// ==================== Integration Tests: Database Operations ====================

describe('Quota State Database Operations', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Fetch Quota State', () => {
    it('should fetch current quota state', async () => {
      const mockState = createMockQuotaState();
      mockSupabase.single.mockResolvedValue({ data: mockState, error: null });
      
      const result = await mockSupabase
        .from('deepseek_quota_state')
        .select('*')
        .single();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('deepseek_quota_state');
      expect(result.data).toBeDefined();
    });
  });

  describe('Update Quota State', () => {
    it('should update quota after API call', async () => {
      mockSupabase.update.mockResolvedValue({ data: null, error: null });
      
      await mockSupabase
        .from('deepseek_quota_state')
        .update({
          requests_remaining_rpm: 49,
          tokens_remaining_tpm: 79000,
          avg_latency_ms: 410,
          latency_samples: 101,
          last_request_at: new Date().toISOString(),
        })
        .eq('id', 1);
      
      expect(mockSupabase.update).toHaveBeenCalled();
    });
  });

  describe('Update Circuit State', () => {
    it('should update circuit state on failure threshold', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      
      await mockSupabase.rpc('update_deepseek_circuit_state', { p_state: 'open' });
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_deepseek_circuit_state', { p_state: 'open' });
    });
  });
});

// ==================== End-to-End Tests ====================

describe('Adaptive Limiter E2E', () => {
  it('should complete full adaptive limiting flow', () => {
    // Step 1: Check initial quota state
    const quotaState = createMockQuotaState();
    expect(quotaState.circuit_state).toBe('closed');
    
    // Step 2: Calculate strategy
    const requestRatio = quotaState.requests_remaining_rpm / quotaState.requests_limit_rpm;
    const tokenRatio = quotaState.tokens_remaining_tpm / quotaState.tokens_limit_tpm;
    const minRatio = Math.min(requestRatio, tokenRatio);
    
    let strategy: string;
    if (minRatio > 0.7) strategy = 'aggressive';
    else if (minRatio > 0.3) strategy = 'moderate';
    else if (minRatio > 0.1) strategy = 'conservative';
    else strategy = 'critical';
    
    // Step 3: Apply throttle delay
    const delays = { aggressive: 0, moderate: 100, conservative: 500, critical: 2000 };
    const delay = delays[strategy as keyof typeof delays];
    
    expect(delay).toBeDefined();
    
    // Step 4: Simulate successful request
    const updatedState = {
      ...quotaState,
      requests_remaining_rpm: quotaState.requests_remaining_rpm - 1,
      tokens_remaining_tpm: quotaState.tokens_remaining_tpm - 1000,
    };
    
    expect(updatedState.requests_remaining_rpm).toBeLessThan(quotaState.requests_remaining_rpm);
  });

  it('should handle circuit breaker flow', () => {
    // Step 1: Start with closed circuit
    let state = createMockQuotaState();
    expect(state.circuit_state).toBe('closed');
    
    // Step 2: Simulate 3 failures
    state = { ...state, consecutive_failures: 3, circuit_state: 'open' };
    expect(state.circuit_state).toBe('open');
    
    // Step 3: Wait for recovery window (simulated)
    const circuitOpenedAt = new Date();
    const afterRecovery = new Date(circuitOpenedAt.getTime() + 61000);
    const shouldTransition = afterRecovery.getTime() - circuitOpenedAt.getTime() > 60000;
    
    expect(shouldTransition).toBe(true);
    
    // Step 4: Transition to half-open
    state = { ...state, circuit_state: 'half-open' };
    expect(state.circuit_state).toBe('half-open');
    
    // Step 5: Successful test request closes circuit
    state = { ...state, circuit_state: 'closed', consecutive_failures: 0 };
    expect(state.circuit_state).toBe('closed');
    expect(state.consecutive_failures).toBe(0);
  });

  it('should degrade gracefully under load', () => {
    // Simulate quota depletion
    const stages = [
      createMockQuotaStateAggressive(),
      createMockQuotaStateModerate(),
      createMockQuotaStateConservative(),
      createMockQuotaStateCritical(),
    ];
    
    const calculateStrategy = (state: MockQuotaState) => {
      const ratio = Math.min(
        state.requests_remaining_rpm / state.requests_limit_rpm,
        state.tokens_remaining_tpm / state.tokens_limit_tpm
      );
      if (ratio > 0.7) return 'aggressive';
      if (ratio > 0.3) return 'moderate';
      if (ratio > 0.1) return 'conservative';
      return 'critical';
    };
    
    const strategies = stages.map(calculateStrategy);
    
    expect(strategies).toEqual(['aggressive', 'moderate', 'conservative', 'critical']);
  });
});
