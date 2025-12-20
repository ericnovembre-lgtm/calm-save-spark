import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, session } = useAuth();

  const { data: prediction, isLoading, refetch, error } = useQuery({
    queryKey: ['predictive-health', user?.id],
    queryFn: async () => {
      // Ensure we have a valid session before calling
      const token = session?.access_token;
      if (!token) {
        throw new Error('No active session');
      }

      // Non-sensitive debug signal (helps diagnose 401s)
      console.debug('[PredictiveHealth] invoking predict-health-score', {
        hasToken: true,
        tokenLength: token.length,
        userId: user?.id,
      });

      const { data, error } = await supabase.functions.invoke('predict-health-score', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;
      return data as HealthPrediction;
    },
    enabled: !!user && !!session?.access_token, // Only run when user is authenticated
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1, // Only retry once on failure
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
    error,
    refetch,
    getScoreColor,
    getScoreLabel,
    getTrendIcon,
  };
}