import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type InsightImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ArchivedInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  content: string;
  source_agent: string | null;
  confidence_score: number | null;
  impact_level: InsightImpactLevel | null;
  action_taken: boolean;
  action_taken_at: string | null;
  action_result: string | null;
  dismissed: boolean;
  dismissed_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  metadata: Record<string, any>;
  expires_at: string | null;
  created_at: string;
}

interface InsightFilters {
  insightType?: string;
  impactLevel?: InsightImpactLevel;
  actionTaken?: boolean;
  dismissed?: boolean;
  sourceAgent?: string;
  startDate?: string;
  endDate?: string;
}

export function useInsightsArchive(filters?: InsightFilters) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['insights-archive', userId, filters],
    queryFn: async (): Promise<ArchivedInsight[]> => {
      if (!userId) return [];

      let query = supabase
        .from('ai_insights_archive')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.insightType) {
        query = query.eq('insight_type', filters.insightType);
      }
      if (filters?.impactLevel) {
        query = query.eq('impact_level', filters.impactLevel);
      }
      if (filters?.actionTaken !== undefined) {
        query = query.eq('action_taken', filters.actionTaken);
      }
      if (filters?.dismissed !== undefined) {
        query = query.eq('dismissed', filters.dismissed);
      }
      if (filters?.sourceAgent) {
        query = query.eq('source_agent', filters.sourceAgent);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as ArchivedInsight[];
    },
    enabled: !!userId,
  });

  const archiveInsight = useMutation({
    mutationFn: async (insight: Omit<ArchivedInsight, 'id' | 'user_id' | 'created_at'>) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_insights_archive')
        .insert({
          user_id: userId,
          ...insight,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights-archive'] });
    },
  });

  const markActionTaken = useMutation({
    mutationFn: async ({ id, result }: { id: string; result?: string }) => {
      const { data, error } = await supabase
        .from('ai_insights_archive')
        .update({
          action_taken: true,
          action_taken_at: new Date().toISOString(),
          action_result: result,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights-archive'] });
      toast.success('Action recorded');
    },
  });

  const dismissInsight = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ai_insights_archive')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights-archive'] });
      toast.success('Insight dismissed');
    },
  });

  const deleteInsight = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_insights_archive')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights-archive'] });
      toast.success('Insight deleted');
    },
  });

  return {
    insights: insights || [],
    isLoading,
    archiveInsight,
    markActionTaken,
    dismissInsight,
    deleteInsight,
  };
}

export function useInsightAnalytics() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['insight-analytics', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('ai_insights_archive')
        .select('insight_type, impact_level, action_taken, dismissed, source_agent, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const insights = data || [];
      
      // Group by type
      const byType: Record<string, number> = {};
      const byImpact: Record<string, number> = {};
      const byAgent: Record<string, number> = {};
      let actedOn = 0;
      let dismissed = 0;

      insights.forEach(insight => {
        byType[insight.insight_type] = (byType[insight.insight_type] || 0) + 1;
        if (insight.impact_level) {
          byImpact[insight.impact_level] = (byImpact[insight.impact_level] || 0) + 1;
        }
        if (insight.source_agent) {
          byAgent[insight.source_agent] = (byAgent[insight.source_agent] || 0) + 1;
        }
        if (insight.action_taken) actedOn++;
        if (insight.dismissed) dismissed++;
      });

      return {
        total: insights.length,
        byType,
        byImpact,
        byAgent,
        actedOn,
        dismissed,
        actionRate: insights.length > 0 ? (actedOn / insights.length) * 100 : 0,
      };
    },
    enabled: !!userId,
  });
}