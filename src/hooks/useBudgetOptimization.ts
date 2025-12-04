import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BudgetCategory {
  name: string;
  currentBudget: number;
  actualSpend: number;
  isEssential: boolean;
}

export interface OptimizationInput {
  monthlyIncome: number;
  currentBudgets: BudgetCategory[];
  savingsGoal: number;
  debtPayments: number;
  optimizationType: 'zero_based' | 'category_optimization' | 'adaptive_reallocation';
  spendingHistory?: { category: string; amount: number; month: string }[];
}

export interface ZeroBasedAllocation {
  category: string;
  amount: number;
  percentage: number;
  priority: number;
  rationale: string;
  isEssential: boolean;
}

export interface CategoryOptimization {
  category: string;
  currentSpend: number;
  suggestedBudget: number;
  savingsOpportunity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tactics: string[];
  benchmark: string;
}

export interface ReallocationSuggestion {
  from: string;
  to: string;
  amount: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface BudgetOptimizationResult {
  zeroBasedBudget: {
    allocations: ZeroBasedAllocation[];
    totalAllocated: number;
    savingsAllocation: number;
    debtAllocation: number;
  };
  categoryOptimizations: CategoryOptimization[];
  reallocationSuggestions: ReallocationSuggestion[];
  savingsProjection: {
    currentRate: number;
    optimizedRate: number;
    monthlyIncrease: number;
    annualImpact: number;
  };
  quickWins: { action: string; savings: number; effort: string }[];
  longTermChanges: { action: string; savings: number; timeframe: string }[];
  reasoning: string;
  chainOfThought?: string;
}

export function useBudgetOptimization() {
  const queryClient = useQueryClient();

  const optimizeMutation = useMutation({
    mutationFn: async (input: OptimizationInput): Promise<BudgetOptimizationResult> => {
      const { data, error } = await supabase.functions.invoke('optimize-budget-zbb', {
        body: input,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-optimization-history'] });
      toast.success('Budget optimization complete');
    },
    onError: (error) => {
      console.error('Budget optimization failed:', error);
      toast.error('Failed to optimize budget');
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['budget-optimization-history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('budget_optimization_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    optimizeBudget: optimizeMutation.mutate,
    isOptimizing: optimizeMutation.isPending,
    result: optimizeMutation.data,
    error: optimizeMutation.error,
    history,
    historyLoading,
  };
}
