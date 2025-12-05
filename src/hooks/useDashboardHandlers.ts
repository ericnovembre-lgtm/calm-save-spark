import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NLQResponse } from '@/lib/ephemeral-widgets';

interface DashboardActions {
  setNlqQuery: (query: string) => void;
  setNlqProcessing: (processing: boolean) => void;
  setNlqShowChart: (show: boolean) => void;
  setNlqChartData: (data: Array<{ name: string; value: number }>) => void;
  setNlqInsight: (insight: string) => void;
  setNlqResponse: (response: NLQResponse | null) => void;
}

interface UseDashboardHandlersProps {
  actions: DashboardActions;
  regenerateDashboard: () => Promise<void>;
  userId?: string;
  refetchProfile?: () => void;
}

export function useDashboardHandlers({
  actions,
  regenerateDashboard,
  userId,
  refetchProfile,
}: UseDashboardHandlersProps) {
  const queryClient = useQueryClient();

  const handleNLQuery = useCallback(async (query: string) => {
    actions.setNlqQuery(query);
    actions.setNlqProcessing(true);
    actions.setNlqShowChart(true);
    actions.setNlqResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-nlq-chart', {
        body: { query }
      });

      if (error) throw error;

      const response = data as NLQResponse;
      actions.setNlqResponse(response);
      
      if (response.type === 'chart') {
        actions.setNlqChartData(response.chartData || []);
        actions.setNlqInsight(response.insight || 'Analysis complete.');
      }
    } catch (error) {
      console.error('NLQ query failed:', error);
      toast.error('Failed to analyze query');
      actions.setNlqChartData([]);
      actions.setNlqInsight('Unable to analyze your spending at this time.');
    } finally {
      actions.setNlqProcessing(false);
    }
  }, [actions]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['connected_accounts'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['pots'] }),
      queryClient.invalidateQueries({ queryKey: ['goals'] }),
      regenerateDashboard()
    ]);
    toast.success('Dashboard refreshed with AI!');
  }, [queryClient, regenerateDashboard]);

  const handleOnboardingComplete = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ show_dashboard_tutorial: false })
      .eq('id', userId);
    refetchProfile?.();
  }, [userId, refetchProfile]);

  return {
    handleNLQuery,
    handleRefresh,
    handleOnboardingComplete,
  };
}
