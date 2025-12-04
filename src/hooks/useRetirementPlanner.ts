import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  targetRetirementIncome: number;
  socialSecurityEstimate: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  taxBracket: number;
  accountBalances: {
    traditional401k: number;
    rothIra: number;
    taxable: number;
  };
}

export interface MonteCarloResults {
  successProbability: number;
  medianOutcome: number;
  p10Outcome: number;
  p90Outcome: number;
  scenarios: { year: number; p10: number; p50: number; p90: number }[];
}

export interface SocialSecurityAnalysis {
  optimalClaimingAge: 62 | 67 | 70;
  benefitAt62: number;
  benefitAt67: number;
  benefitAt70: number;
  breakEvenAge62vs67: number;
  breakEvenAge67vs70: number;
  lifetimeValueAt62: number;
  lifetimeValueAt67: number;
  lifetimeValueAt70: number;
  recommendation: string;
}

export interface WithdrawalStrategy {
  optimalSequence: string[];
  firstYearWithdrawals: {
    traditional: number;
    roth: number;
    taxable: number;
  };
  safeWithdrawalRate: number;
  rothConversionOpportunity: {
    recommendedAmount: number;
    taxSavings: number;
    optimalYears: number[];
  };
  rmdProjections: { age: number; amount: number }[];
}

export interface RetirementPlanResult {
  monteCarloResults: MonteCarloResults;
  socialSecurityAnalysis: SocialSecurityAnalysis;
  withdrawalStrategy: WithdrawalStrategy;
  sensitivityAnalysis: { factor: string; impact: string; description: string }[];
  recommendations: { priority: number; action: string; impact: string; timeline: string }[];
  reasoning: string;
  chainOfThought?: string;
}

export function useRetirementPlanner() {
  const queryClient = useQueryClient();

  const planMutation = useMutation({
    mutationFn: async (input: RetirementInput): Promise<RetirementPlanResult> => {
      const { data, error } = await supabase.functions.invoke('retirement-planner', {
        body: input,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retirement-plan'] });
      toast.success('Retirement plan calculated');
    },
    onError: (error) => {
      console.error('Retirement planning failed:', error);
      toast.error('Failed to calculate retirement plan');
    },
  });

  const { data: savedPlan, isLoading: planLoading } = useQuery({
    queryKey: ['retirement-plan'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('retirement_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    calculatePlan: planMutation.mutate,
    isCalculating: planMutation.isPending,
    result: planMutation.data,
    error: planMutation.error,
    savedPlan,
    planLoading,
  };
}
