import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClaudeHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  apiKeyConfigured: boolean;
  apiKeyValid: boolean;
  modelResponding: boolean;
  latencyMs: number;
  model: string;
  error?: string;
  rateLimitReset?: string;
  timestamp: string;
}

export interface ClaudeMetric {
  id: string;
  request_id: string | null;
  conversation_id: string | null;
  user_id: string | null;
  agent_type: string;
  model: string;
  latency_ms: number;
  time_to_first_token_ms: number | null;
  total_stream_time_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  status: 'success' | 'error' | 'rate_limited';
  error_type: string | null;
  error_message: string | null;
  rate_limit_remaining: number | null;
  rate_limit_reset: string | null;
  tools_used: string[] | null;
  tool_count: number;
  created_at: string;
}

export interface MetricsStats {
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  totalTokens: number;
  errorCount: number;
  rateLimitCount: number;
}

/**
 * Hook to fetch Claude API health status
 */
export function useClaudeHealth(refreshInterval = 30000) {
  return useQuery<ClaudeHealthStatus>({
    queryKey: ['claude-health'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('ai-agent-health');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.data as ClaudeHealthStatus;
    },
    refetchInterval: refreshInterval,
    staleTime: 10000,
  });
}

/**
 * Hook to fetch Claude API metrics with optional filters
 */
export function useClaudeMetrics(options: {
  limit?: number;
  agentType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const { limit = 100, agentType, status, startDate, endDate } = options;

  return useQuery<ClaudeMetric[]>({
    queryKey: ['claude-metrics', { limit, agentType, status, startDate, endDate }],
    queryFn: async () => {
      let query = supabase
        .from('claude_api_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (agentType) {
        query = query.eq('agent_type', agentType);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as ClaudeMetric[];
    },
    staleTime: 30000,
  });
}

/**
 * Hook to fetch aggregated metrics stats
 */
export function useClaudeMetricsStats(hours = 24) {
  return useQuery<MetricsStats>({
    queryKey: ['claude-metrics-stats', hours],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const { data, error } = await supabase
        .from('claude_api_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) {
        throw error;
      }

      const metrics = (data || []) as ClaudeMetric[];
      const totalRequests = metrics.length;
      const successCount = metrics.filter(m => m.status === 'success').length;
      const errorCount = metrics.filter(m => m.status === 'error').length;
      const rateLimitCount = metrics.filter(m => m.status === 'rate_limited').length;
      
      const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
      
      const latencies = metrics.map(m => m.latency_ms).filter(l => l > 0);
      const averageLatency = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : 0;

      const totalTokens = metrics.reduce((sum, m) => sum + (m.total_tokens || 0), 0);

      return {
        totalRequests,
        successRate,
        averageLatency,
        totalTokens,
        errorCount,
        rateLimitCount,
      };
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch metrics grouped by time for charts
 */
export function useClaudeMetricsTimeSeries(hours = 24) {
  return useQuery({
    queryKey: ['claude-metrics-timeseries', hours],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const { data, error } = await supabase
        .from('claude_api_metrics')
        .select('created_at, latency_ms, status, input_tokens, output_tokens, agent_type')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Group by hour
      const hourlyData: Record<string, {
        hour: string;
        requests: number;
        avgLatency: number;
        errors: number;
        tokens: number;
        latencies: number[];
      }> = {};

      (data || []).forEach((metric: any) => {
        const date = new Date(metric.created_at);
        const hourKey = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = {
            hour: hourKey,
            requests: 0,
            avgLatency: 0,
            errors: 0,
            tokens: 0,
            latencies: [],
          };
        }

        hourlyData[hourKey].requests++;
        hourlyData[hourKey].latencies.push(metric.latency_ms);
        if (metric.status !== 'success') {
          hourlyData[hourKey].errors++;
        }
        hourlyData[hourKey].tokens += (metric.input_tokens || 0) + (metric.output_tokens || 0);
      });

      // Calculate averages
      return Object.values(hourlyData).map(h => ({
        hour: h.hour,
        requests: h.requests,
        avgLatency: h.latencies.length > 0 
          ? Math.round(h.latencies.reduce((a, b) => a + b, 0) / h.latencies.length)
          : 0,
        errors: h.errors,
        tokens: h.tokens,
      }));
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch agent type breakdown
 */
export function useClaudeAgentBreakdown(hours = 24) {
  return useQuery({
    queryKey: ['claude-agent-breakdown', hours],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const { data, error } = await supabase
        .from('claude_api_metrics')
        .select('agent_type, status')
        .gte('created_at', startDate.toISOString());

      if (error) {
        throw error;
      }

      // Group by agent type
      const breakdown: Record<string, { total: number; success: number; errors: number }> = {};

      (data || []).forEach((metric: any) => {
        const agent = metric.agent_type || 'unknown';
        if (!breakdown[agent]) {
          breakdown[agent] = { total: 0, success: 0, errors: 0 };
        }
        breakdown[agent].total++;
        if (metric.status === 'success') {
          breakdown[agent].success++;
        } else {
          breakdown[agent].errors++;
        }
      });

      return Object.entries(breakdown).map(([agent, stats]) => ({
        agent,
        ...stats,
        successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
      }));
    },
    staleTime: 60000,
  });
}
