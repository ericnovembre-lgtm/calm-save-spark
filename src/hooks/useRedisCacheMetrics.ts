import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunctionMetric {
  function: string;
  hits: number;
  misses: number;
  hitRate: number;
}

interface CacheMetricsResponse {
  functions: FunctionMetric[];
  summary: {
    totalHits: number;
    totalMisses: number;
    totalRequests: number;
    overallHitRate: number;
    cachedItems: number;
  };
  timestamp: string;
}

export function useRedisCacheMetrics() {
  return useQuery({
    queryKey: ['redis-cache-metrics'],
    queryFn: async (): Promise<CacheMetricsResponse> => {
      const { data, error } = await supabase.functions.invoke('cache-metrics');
      
      if (error) {
        console.error('[useRedisCacheMetrics] Error fetching metrics:', error);
        throw error;
      }
      
      return data as CacheMetricsResponse;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}
