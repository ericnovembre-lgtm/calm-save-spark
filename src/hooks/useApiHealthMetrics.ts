import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LatencyTrendPoint {
  date: string;
  avgLatency: number;
  p95Latency: number;
  batchCount: number;
}

export interface ThroughputTrendPoint {
  date: string;
  processed: number;
  anomalies: number;
  efficiency: number;
}

export interface CircuitEvent {
  timestamp: string;
  state: string;
  consecutiveFailures: number;
}

export interface ApiHealthSummary {
  totalBatches: number;
  totalProcessed: number;
  totalAnomalies: number;
  avgLatency: number;
  avgEfficiency: number;
  anomalyRate: number;
}

export interface ApiHealthMetrics {
  latencyTrends: LatencyTrendPoint[];
  throughputTrends: ThroughputTrendPoint[];
  circuitEvents: CircuitEvent[];
  summary: ApiHealthSummary;
}

type TimeRange = '24h' | '7d' | '30d';

export function useApiHealthMetrics(timeRange: TimeRange = '7d') {
  return useQuery({
    queryKey: ['api-health-metrics', timeRange],
    queryFn: async (): Promise<ApiHealthMetrics> => {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch batch processing analytics
      const { data: batchData, error: batchError } = await supabase
        .from('batch_processing_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (batchError) {
        console.error('Error fetching batch analytics:', batchError);
        throw batchError;
      }

      // Group data by day for trends
      const dailyData = new Map<string, {
        latencies: number[];
        processed: number;
        anomalies: number;
        batchCount: number;
      }>();

      (batchData || []).forEach((batch) => {
        const date = new Date(batch.created_at!).toISOString().split('T')[0];
        if (!dailyData.has(date)) {
          dailyData.set(date, { latencies: [], processed: 0, anomalies: 0, batchCount: 0 });
        }
        const day = dailyData.get(date)!;
        day.latencies.push(batch.groq_latency_ms);
        day.processed += batch.transactions_processed;
        day.anomalies += batch.anomalies_detected || 0;
        day.batchCount += 1;
      });

      // Calculate latency trends
      const latencyTrends: LatencyTrendPoint[] = Array.from(dailyData.entries()).map(([date, data]) => {
        const sorted = [...data.latencies].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        return {
          date,
          avgLatency: Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length),
          p95Latency: sorted[p95Index] || sorted[sorted.length - 1] || 0,
          batchCount: data.batchCount,
        };
      });

      // Calculate throughput trends
      const throughputTrends: ThroughputTrendPoint[] = Array.from(dailyData.entries()).map(([date, data]) => ({
        date,
        processed: data.processed,
        anomalies: data.anomalies,
        efficiency: data.processed > 0 ? Math.round((1 - data.anomalies / data.processed) * 100) : 100,
      }));

      // Fetch circuit breaker state history from groq_quota_state
      const { data: quotaData } = await supabase
        .from('groq_quota_state')
        .select('circuit_state, circuit_opened_at, consecutive_failures, updated_at')
        .limit(1)
        .single();

      // Create circuit events from current state
      const circuitEvents: CircuitEvent[] = [];
      if (quotaData?.circuit_opened_at) {
        circuitEvents.push({
          timestamp: quotaData.circuit_opened_at,
          state: 'open',
          consecutiveFailures: quotaData.consecutive_failures || 0,
        });
      }
      if (quotaData?.circuit_state && quotaData.circuit_state !== 'open') {
        circuitEvents.push({
          timestamp: quotaData.updated_at || new Date().toISOString(),
          state: quotaData.circuit_state,
          consecutiveFailures: quotaData.consecutive_failures || 0,
        });
      }

      // Calculate summary
      const allLatencies = (batchData || []).map(b => b.groq_latency_ms);
      const totalProcessed = (batchData || []).reduce((sum, b) => sum + b.transactions_processed, 0);
      const totalAnomalies = (batchData || []).reduce((sum, b) => sum + (b.anomalies_detected || 0), 0);

      const summary: ApiHealthSummary = {
        totalBatches: batchData?.length || 0,
        totalProcessed,
        totalAnomalies,
        avgLatency: allLatencies.length > 0 
          ? Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length) 
          : 0,
        avgEfficiency: totalProcessed > 0 
          ? Math.round((1 - totalAnomalies / totalProcessed) * 100) 
          : 100,
        anomalyRate: totalProcessed > 0 
          ? Math.round((totalAnomalies / totalProcessed) * 1000) / 10 
          : 0,
      };

      return {
        latencyTrends,
        throughputTrends,
        circuitEvents,
        summary,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}
