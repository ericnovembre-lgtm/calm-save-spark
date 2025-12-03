import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelDistribution {
  model: string;
  modelName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CostSavings {
  totalCost: number;
  costWithoutRouting: number;
  savings: number;
  savingsPercentage: number;
}

export interface DailyTrend {
  date: string;
  gemini: number;
  claude: number;
  perplexity: number;
  groq: number;
  total: number;
}

export interface ResponseTime {
  model: string;
  avgResponseMs: number;
}

export interface FallbackStats {
  totalFallbacks: number;
  fallbackRate: number;
  topReasons: string[];
}

export interface AnalyticsSummary {
  totalQueries: number;
  totalConversations: number;
  avgConfidence: number;
}

export interface AIRoutingAnalytics {
  modelDistribution: ModelDistribution[];
  costSavings: CostSavings;
  dailyTrends: DailyTrend[];
  responseTimeByModel: ResponseTime[];
  fallbackStats: FallbackStats;
  summary: AnalyticsSummary;
}

export function useAIRoutingAnalytics(timeRange: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: ['ai-routing-analytics', timeRange],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ai-routing-analytics?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch analytics');
      }

      return await response.json() as AIRoutingAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
