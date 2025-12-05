import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinancialAnomaly {
  id: string;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    type: string;
    deviation: number;
    description: string;
  }[];
  affected_entity_type?: string;
  affected_entity_id?: string;
  detected_at: string;
  resolved_at?: string;
  resolution_type?: string;
  false_positive: boolean;
}

export function useAnomalyAlerts() {
  const queryClient = useQueryClient();

  const { data: anomalies, isLoading } = useQuery({
    queryKey: ['financial-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_anomalies')
        .select('*')
        .is('resolved_at', null)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        factors: Array.isArray(item.factors) ? item.factors : [],
      })) as unknown as FinancialAnomaly[];
    },
  });

  const scanForAnomalies = useMutation({
    mutationFn: async () => {
      // Check if user is authenticated before calling
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[useAnomalyAlerts] No session, skipping anomaly scan');
        return { anomalies: [] };
      }

      const { data, error } = await supabase.functions.invoke('multi-factor-anomaly');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-anomalies'] });
    },
  });

  const resolveAnomaly = useMutation({
    mutationFn: async ({
      anomalyId,
      resolutionType,
      falsePositive = false,
    }: {
      anomalyId: string;
      resolutionType: string;
      falsePositive?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('financial_anomalies')
        .update({
          resolved_at: new Date().toISOString(),
          resolution_type: resolutionType,
          false_positive: falsePositive,
        })
        .eq('id', anomalyId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-anomalies'] });
    },
  });

  const criticalCount = anomalies?.filter(a => a.severity === 'critical').length || 0;
  const highCount = anomalies?.filter(a => a.severity === 'high').length || 0;
  const mediumCount = anomalies?.filter(a => a.severity === 'medium').length || 0;
  const lowCount = anomalies?.filter(a => a.severity === 'low').length || 0;

  return {
    anomalies,
    isLoading,
    scanForAnomalies,
    resolveAnomaly,
    summary: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      total: anomalies?.length || 0,
    },
  };
}