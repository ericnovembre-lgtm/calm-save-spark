import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsSummary {
  totalSimulations: number;
  totalChatQueries: number;
  scenariosSaved: number;
  insightsGenerated: number;
  nlScenariosCreated: number;
  avgResponseTime: number;
}

export interface DailyActivity {
  date: string;
  count: number;
}

export interface LifeEventCount {
  event: string;
  count: number;
}

export interface RecentInsight {
  summary: string;
  createdAt: string;
  eventType: string;
}

export interface ProbabilityTrend {
  date: string;
  probability: number;
}

export interface DigitalTwinAnalyticsData {
  summary: AnalyticsSummary;
  modelUsage: Record<string, number>;
  dailyActivity: DailyActivity[];
  lifeEventsCount: LifeEventCount[];
  recentInsights: RecentInsight[];
  probabilityTrends: ProbabilityTrend[];
  rawData: any[];
}

export function useDigitalTwinAnalytics(days: number = 30) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['digital-twin-analytics', days],
    queryFn: async (): Promise<DigitalTwinAnalyticsData> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-digital-twin-analytics?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logAnalyticsEvent = useMutation({
    mutationFn: async (event: {
      eventType: 'simulation_run' | 'chat_query' | 'scenario_saved' | 'insight_generated' | 'scenario_created_nl';
      modelUsed?: string;
      responseTimeMs?: number;
      tokenCount?: number;
      scenarioParameters?: any;
      outcomeMetrics?: any;
      queryText?: string;
      insightSummary?: string;
      sessionId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('digital_twin_analytics').insert({
        user_id: user.id,
        event_type: event.eventType,
        model_used: event.modelUsed,
        response_time_ms: event.responseTimeMs,
        token_count: event.tokenCount,
        scenario_parameters: event.scenarioParameters,
        outcome_metrics: event.outcomeMetrics,
        query_text: event.queryText,
        insight_summary: event.insightSummary,
        session_id: event.sessionId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-twin-analytics'] });
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    logAnalyticsEvent: logAnalyticsEvent.mutate,
    isLogging: logAnalyticsEvent.isPending,
  };
}
