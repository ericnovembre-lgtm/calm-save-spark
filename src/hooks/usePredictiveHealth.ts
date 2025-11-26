import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HealthPrediction {
  current_score: number;
  predicted_30d: number;
  predicted_60d: number;
  predicted_90d: number;
  factors: {
    factor: string;
    impact: number;
    trend: 'improving' | 'stable' | 'declining';
    description: string;
  }[];
  recommendations: {
    action: string;
    impact_score: number;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export function usePredictiveHealth() {
  const { data: prediction, isLoading, refetch } = useQuery({
    queryKey: ['predictive-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('predict-health-score');

      if (error) throw error;
      return data as HealthPrediction;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  return {
    prediction,
    isLoading,
    refetch,
    getScoreColor,
    getScoreLabel,
    getTrendIcon,
  };
}