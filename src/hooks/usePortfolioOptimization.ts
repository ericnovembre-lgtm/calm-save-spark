import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  purchaseDate: string;
  accountType: 'taxable' | 'ira' | 'roth';
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  beta: number;
  volatility: number;
}

export interface TaxAnalysis {
  totalUnrealizedGains: number;
  totalUnrealizedLosses: number;
  potentialTaxSavings: number;
  washSaleRisks: { symbol: string; riskLevel: string; waitDays: number }[];
}

export interface RebalancingRecommendation {
  action: 'buy' | 'sell';
  symbol: string;
  shares: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TaxLossHarvestingAction {
  sellSymbol: string;
  sellShares: number;
  taxSavings: number;
  replacementSymbol: string;
  correlation: number;
  washSaleDate: string;
}

export interface PortfolioOptimizationResult {
  riskMetrics: RiskMetrics;
  taxAnalysis: TaxAnalysis;
  rebalancingRecommendations: RebalancingRecommendation[];
  taxLossHarvestingActions: TaxLossHarvestingAction[];
  optimalAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };
  reasoning: string;
  chainOfThought?: string;
}

interface OptimizePortfolioParams {
  holdings: PortfolioHolding[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  taxBracket: number;
  optimizationType: 'rebalance' | 'tax_loss_harvest' | 'risk_analysis' | 'full';
}

export function usePortfolioOptimization() {
  const queryClient = useQueryClient();

  const optimizeMutation = useMutation({
    mutationFn: async (params: OptimizePortfolioParams): Promise<PortfolioOptimizationResult> => {
      const { data, error } = await supabase.functions.invoke('optimize-portfolio', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-optimization-history'] });
      toast.success('Portfolio optimization complete');
    },
    onError: (error) => {
      console.error('Portfolio optimization failed:', error);
      toast.error('Failed to optimize portfolio');
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['portfolio-optimization-history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('portfolio_optimization_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    optimizePortfolio: optimizeMutation.mutate,
    isOptimizing: optimizeMutation.isPending,
    result: optimizeMutation.data,
    error: optimizeMutation.error,
    history,
    historyLoading,
  };
}
