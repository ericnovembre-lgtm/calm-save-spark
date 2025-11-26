import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GoalOptimization {
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  remainingAmount: number;
  suggestedMonthlyAmount: number;
  suggestedWeeklyAmount: number;
  estimatedCompletion: string;
  priorityScore: number;
  onTrack: boolean;
}

export interface Recommendation {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export interface OptimizationData {
  optimizations: GoalOptimization[];
  recommendations: Recommendation[];
  summary: {
    totalGoals: number;
    monthlyDisposable: number;
    totalMonthlyAllocation: number;
    averageCompletionTime: number;
  };
}

export function useGoalOptimization() {
  return useQuery<OptimizationData>({
    queryKey: ['goal-optimization'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('optimize-goals');
      if (error) throw error;
      return data as OptimizationData;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}