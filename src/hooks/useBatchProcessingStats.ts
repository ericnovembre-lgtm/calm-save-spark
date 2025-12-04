import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BatchStats {
  queueDepth: number;
  recentBatches: number;
  avgBatchLatency: number;
  avgGroqLatency: number;
  throughput: number; // transactions per minute
  efficiency: number; // avg transactions per API call
  anomalyRate: number;
  status: 'idle' | 'processing' | 'high_volume' | 'throttled';
}

export function useBatchProcessingStats() {
  return useQuery({
    queryKey: ['batch-processing-stats'],
    queryFn: async (): Promise<BatchStats> => {
      // Get current queue depth
      const { count: queueDepth } = await supabase
        .from('transaction_alert_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get processing count
      const { count: processingCount } = await supabase
        .from('transaction_alert_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing');

      // Get recent batch analytics (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentBatches } = await supabase
        .from('batch_processing_analytics')
        .select('*')
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false });

      const batches = recentBatches || [];
      const successfulBatches = batches.filter(b => !b.error_message);

      // Calculate metrics
      const avgBatchLatency = successfulBatches.length > 0
        ? successfulBatches.reduce((sum, b) => sum + (b.total_processing_ms || 0), 0) / successfulBatches.length
        : 0;

      const avgGroqLatency = successfulBatches.length > 0
        ? successfulBatches.reduce((sum, b) => sum + (b.groq_latency_ms || 0), 0) / successfulBatches.length
        : 0;

      const totalProcessed = successfulBatches.reduce((sum, b) => sum + (b.transactions_processed || 0), 0);
      const totalAnomalies = successfulBatches.reduce((sum, b) => sum + (b.anomalies_detected || 0), 0);
      
      // Throughput: transactions per minute over the last hour
      const throughput = totalProcessed / 60;

      // Efficiency: average transactions per batch (API call)
      const efficiency = successfulBatches.length > 0
        ? totalProcessed / successfulBatches.length
        : 0;

      // Anomaly rate
      const anomalyRate = totalProcessed > 0
        ? (totalAnomalies / totalProcessed) * 100
        : 0;

      // Determine status
      let status: BatchStats['status'] = 'idle';
      if ((processingCount || 0) > 0) {
        status = 'processing';
      }
      if ((queueDepth || 0) > 20) {
        status = 'high_volume';
      }
      if (avgGroqLatency > 500) {
        status = 'throttled';
      }

      return {
        queueDepth: queueDepth || 0,
        recentBatches: batches.length,
        avgBatchLatency: Math.round(avgBatchLatency),
        avgGroqLatency: Math.round(avgGroqLatency),
        throughput: Math.round(throughput * 10) / 10,
        efficiency: Math.round(efficiency * 10) / 10,
        anomalyRate: Math.round(anomalyRate * 10) / 10,
        status
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000
  });
}
