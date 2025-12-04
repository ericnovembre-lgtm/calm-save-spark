import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface GrokQuotaStatus {
  requestsRemaining: number;
  requestsLimit: number;
  tokensRemaining: number;
  tokensLimit: number;
  avgLatency: number;
  consecutiveFailures: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  totalCostEstimate: number;
  totalRequestsCount: number;
  sentimentQueriesCount: number;
  strategy: AdaptiveStrategy;
  requestsUsagePercent: number;
  tokensUsagePercent: number;
  lastRequestAt: string | null;
}

function calculateStrategy(requestsRatio: number, tokensRatio: number): AdaptiveStrategy {
  const minRatio = Math.min(requestsRatio, tokensRatio);
  if (minRatio > 0.7) return 'aggressive';
  if (minRatio > 0.3) return 'moderate';
  if (minRatio > 0.1) return 'conservative';
  return 'critical';
}

export function useGrokQuotaStatus() {
  return useQuery({
    queryKey: ['grok-quota-status'],
    queryFn: async (): Promise<GrokQuotaStatus> => {
      const { data, error } = await supabase
        .from('grok_quota_state')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching Grok quota status:', error);
        // Return default values on error
        return {
          requestsRemaining: 60,
          requestsLimit: 60,
          tokensRemaining: 100000,
          tokensLimit: 100000,
          avgLatency: 0,
          consecutiveFailures: 0,
          circuitState: 'closed',
          circuitOpenedAt: null,
          totalCostEstimate: 0,
          totalRequestsCount: 0,
          sentimentQueriesCount: 0,
          strategy: 'aggressive',
          requestsUsagePercent: 0,
          tokensUsagePercent: 0,
          lastRequestAt: null,
        };
      }

      const requestsRatio = data.requests_remaining_rpm / data.requests_limit_rpm;
      const tokensRatio = data.tokens_remaining_tpm / data.tokens_limit_tpm;

      return {
        requestsRemaining: data.requests_remaining_rpm,
        requestsLimit: data.requests_limit_rpm,
        tokensRemaining: data.tokens_remaining_tpm,
        tokensLimit: data.tokens_limit_tpm,
        avgLatency: data.avg_latency_ms,
        consecutiveFailures: data.consecutive_failures,
        circuitState: data.circuit_state as CircuitState,
        circuitOpenedAt: data.circuit_opened_at,
        totalCostEstimate: parseFloat(String(data.total_cost_estimate)) || 0,
        totalRequestsCount: data.total_requests_count,
        sentimentQueriesCount: data.sentiment_queries_count,
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
