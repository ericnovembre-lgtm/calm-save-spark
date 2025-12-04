import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface DeepseekQuotaStatus {
  requestsRemaining: number;
  requestsLimit: number;
  tokensRemaining: number;
  tokensLimit: number;
  reasoningTokensUsed: number;
  avgLatency: number;
  consecutiveFailures: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  totalCostEstimate: number;
  strategy: AdaptiveStrategy;
  requestsUsagePercent: number;
  tokensUsagePercent: number;
  lastRequestAt: string | null;
}

function calculateStrategy(requestsRatio: number, tokensRatio: number): AdaptiveStrategy {
  const ratio = Math.min(requestsRatio, tokensRatio);
  if (ratio > 0.7) return 'aggressive';
  if (ratio > 0.3) return 'moderate';
  if (ratio > 0.1) return 'conservative';
  return 'critical';
}

export function useDeepseekQuotaStatus() {
  return useQuery({
    queryKey: ['deepseek-quota-status'],
    queryFn: async (): Promise<DeepseekQuotaStatus> => {
      const { data, error } = await supabase
        .from('deepseek_quota_state')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Failed to fetch Deepseek quota status:', error);
        // Return default state
        return {
          requestsRemaining: 60,
          requestsLimit: 60,
          tokensRemaining: 1000000,
          tokensLimit: 1000000,
          reasoningTokensUsed: 0,
          avgLatency: 0,
          consecutiveFailures: 0,
          circuitState: 'closed',
          circuitOpenedAt: null,
          totalCostEstimate: 0,
          strategy: 'aggressive',
          requestsUsagePercent: 0,
          tokensUsagePercent: 0,
          lastRequestAt: null,
        };
      }

      const requestsRemaining = data.requests_remaining_rpm || 60;
      const requestsLimit = data.requests_limit_rpm || 60;
      const tokensRemaining = data.tokens_remaining_tpm || 1000000;
      const tokensLimit = data.tokens_limit_tpm || 1000000;

      const requestsRatio = requestsRemaining / requestsLimit;
      const tokensRatio = tokensRemaining / tokensLimit;

      return {
        requestsRemaining,
        requestsLimit,
        tokensRemaining,
        tokensLimit,
        reasoningTokensUsed: data.reasoning_tokens_used || 0,
        avgLatency: data.avg_latency_ms || 0,
        consecutiveFailures: data.consecutive_failures || 0,
        circuitState: (data.circuit_state as CircuitState) || 'closed',
        circuitOpenedAt: data.circuit_opened_at,
        totalCostEstimate: parseFloat(String(data.total_cost_estimate)) || 0,
        strategy: calculateStrategy(requestsRatio, tokensRatio),
        requestsUsagePercent: Math.round((1 - requestsRatio) * 100),
        tokensUsagePercent: Math.round((1 - tokensRatio) * 100),
        lastRequestAt: data.last_request_at,
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}
