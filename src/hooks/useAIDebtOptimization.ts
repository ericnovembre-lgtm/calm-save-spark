import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DebtAllocation {
  debt_name: string;
  recommended_extra_payment: number;
  mathematical_reasoning: string;
}

interface AIDebtRecommendations {
  recommended_strategy: 'avalanche' | 'snowball' | 'hybrid';
  mathematical_proof?: string;
  optimal_allocation?: DebtAllocation[];
  hybrid_recommendation?: string | null;
  breakeven_extra_payment?: number;
  interest_savings_vs_alternative?: number;
  time_savings_months?: number;
  psychological_score?: number;
  key_insight?: string;
  insight_message?: string;
  savings_amount?: number;
  time_difference_months?: number;
  highlighted_debt?: string;
  urgency_level?: 'low' | 'medium' | 'high';
  reasoning_chain?: string;
  model?: string;
}

interface SimulationSummary {
  strategy: string;
  months_to_payoff: number;
  years_to_payoff: string;
  total_principal: number;
  total_interest_paid: number;
  total_paid: number;
  extra_payment_per_month: number;
}

interface AIDebtOptimizationResult {
  summary: SimulationSummary | null;
  comparison: {
    avalanche: SimulationSummary;
    snowball: SimulationSummary;
  } | null;
  aiRecommendations: AIDebtRecommendations | null;
  reasoningChain: string | null;
  model: string | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAIDebtOptimizationParams {
  strategy: 'avalanche' | 'snowball';
  extraPayment: number;
  enabled: boolean;
  includeAI?: boolean;
}

export function useAIDebtOptimization({
  strategy,
  extraPayment,
  enabled,
  includeAI = false
}: UseAIDebtOptimizationParams): AIDebtOptimizationResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['debt_simulation_ai', strategy, extraPayment, includeAI],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            strategy, 
            extraPayment,
            includeAIRecommendations: includeAI
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Simulation failed');
      }
      
      return response.json();
    },
    enabled,
    staleTime: includeAI ? 60000 : 30000, // Cache AI results longer
  });

  return {
    summary: data?.summary || null,
    comparison: data?.comparison || null,
    aiRecommendations: data?.aiRecommendations || null,
    reasoningChain: data?.reasoningChain || null,
    model: data?.model || null,
    isLoading,
    error: error as Error | null
  };
}

// Hook specifically for AI strategy analysis
export function useDebtStrategyAnalysis({
  debts,
  avalancheSummary,
  snowballSummary,
  currentStrategy,
  extraPayment,
  enabled
}: {
  debts: any[];
  avalancheSummary: SimulationSummary | null;
  snowballSummary: SimulationSummary | null;
  currentStrategy: 'avalanche' | 'snowball';
  extraPayment: number;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ['debt_strategy_analysis', debts?.length, currentStrategy, extraPayment],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-debt-strategy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            debts,
            avalancheSummary,
            snowballSummary,
            currentStrategy,
            extraPayment
          })
        }
      );

      if (!response.ok) {
        throw new Error('Strategy analysis failed');
      }

      return response.json() as Promise<AIDebtRecommendations>;
    },
    enabled: enabled && !!debts?.length && !!avalancheSummary && !!snowballSummary,
    staleTime: 120000, // Cache for 2 minutes
  });
}
