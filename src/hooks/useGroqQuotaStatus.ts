import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdaptiveStrategy = 'aggressive' | 'moderate' | 'conservative' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface GroqQuotaStatus {
  requestsRemaining: number;
  requestsLimit: number;
  tokensRemaining: number;
  tokensLimit: number;
  avgLatency: number;
  circuitState: CircuitState;
  circuitOpenedAt: string | null;
  consecutiveFailures: number;
  strategy: AdaptiveStrategy;
  requestsPercentUsed: number;
  tokensPercentUsed: number;
  lastRequestAt: string | null;
}

function calculateStrategy(requestsRatio: number, tokensRatio: number): AdaptiveStrategy {
  const minRatio = Math.min(requestsRatio, tokensRatio);
  if (minRatio > 0.7) return 'aggressive';
  if (minRatio > 0.3) return 'moderate';
  if (minRatio > 0.1) return 'conservative';
  return 'critical';
}

export function useGroqQuotaStatus() {
  return useQuery({
    queryKey: ['groq-quota-status'],
    queryFn: async (): Promise<GroqQuotaStatus> => {
      const { data, error } = await supabase
        .from('groq_quota_state')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      const requestsRatio = data.requests_remaining_rpd / data.requests_limit_rpd;
      const tokensRatio = data.tokens_remaining_tpm / data.tokens_limit_tpm;

      return {
        requestsRemaining: data.requests_remaining_rpd,
        requestsLimit: data.requests_limit_rpd,
        tokensRemaining: data.tokens_remaining_tpm,
        tokensLimit: data.tokens_limit_tpm,
        avgLatency: data.avg_latency_ms,
        circuitState: data.circuit_state as CircuitState,
        circuitOpenedAt: data.circuit_opened_at,
        consecutiveFailures: data.consecutive_failures,
        strategy: calculateStrategy(requestsRatio, tokensRatio),
        requestsPercentUsed: Math.round((1 - requestsRatio) * 100),
        tokensPercentUsed: Math.round((1 - tokensRatio) * 100),
        lastRequestAt: data.last_request_at,
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 3000,
  });
}
