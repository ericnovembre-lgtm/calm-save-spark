import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Phase4FunctionMetrics {
  functionName: string;
  displayName: string;
  queryCount: number;
  avgLatency: number;
  totalReasoningTokens: number;
  estimatedCost: number;
  color: string;
  icon: string;
}

export interface DeepseekMetrics {
  totalQueries: number;
  totalReasoningTokens: number;
  totalCompletionTokens: number;
  avgReasoningTokensPerQuery: number;
  reasoningToCompletionRatio: number;
  totalCost: number;
  avgLatency: number;
  queryTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  latencyTrends: {
    date: string;
    avgLatency: number;
    queryCount: number;
  }[];
  costComparison: {
    deepseekCost: number;
    claudeEquivalentCost: number;
    savings: number;
    savingsPercentage: number;
  };
  phase4Functions: Phase4FunctionMetrics[];
}

export function useDeepseekMetrics(timeRange: '24h' | '7d' | '30d' = '7d') {
  return useQuery({
    queryKey: ['deepseek-metrics', timeRange],
    queryFn: async (): Promise<DeepseekMetrics> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate start date
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch Deepseek-specific analytics
      const { data: analytics, error } = await supabase
        .from('ai_model_routing_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('model_used', 'deepseek-reasoner')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const items = analytics || [];
      const totalQueries = items.length;

      // Calculate token metrics
      const totalReasoningTokens = items.reduce((sum, item) => 
        sum + ((item as any).reasoning_tokens || 0), 0);
      const totalCompletionTokens = items.reduce((sum, item) => 
        sum + (item.token_count || 0), 0);
      const avgReasoningTokensPerQuery = totalQueries > 0 
        ? Math.round(totalReasoningTokens / totalQueries) 
        : 0;
      const reasoningToCompletionRatio = totalCompletionTokens > 0
        ? Number((totalReasoningTokens / totalCompletionTokens).toFixed(2))
        : 0;

      // Cost calculation (Deepseek ~$0.02 per query vs Claude ~$0.50)
      const DEEPSEEK_COST_PER_QUERY = 0.02;
      const CLAUDE_COST_PER_QUERY = 0.50;
      const deepseekCost = Number((totalQueries * DEEPSEEK_COST_PER_QUERY).toFixed(2));
      const claudeEquivalentCost = Number((totalQueries * CLAUDE_COST_PER_QUERY).toFixed(2));
      const savings = Number((claudeEquivalentCost - deepseekCost).toFixed(2));
      const savingsPercentage = claudeEquivalentCost > 0 
        ? Number(((savings / claudeEquivalentCost) * 100).toFixed(1))
        : 0;

      // Latency metrics
      const avgLatency = totalQueries > 0
        ? Math.round(items.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / totalQueries)
        : 0;

      // Query type distribution
      const queryTypes: Record<string, number> = {};
      items.forEach(item => {
        const type = item.query_type || 'unknown';
        queryTypes[type] = (queryTypes[type] || 0) + 1;
      });
      const queryTypeDistribution = Object.entries(queryTypes).map(([type, count]) => ({
        type,
        count,
        percentage: totalQueries > 0 ? Number(((count / totalQueries) * 100).toFixed(1)) : 0
      }));

      // Daily latency trends
      const dailyData: Record<string, { totalLatency: number; count: number }> = {};
      items.forEach(item => {
        const date = new Date(item.created_at!).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { totalLatency: 0, count: 0 };
        }
        dailyData[date].totalLatency += item.response_time_ms || 0;
        dailyData[date].count++;
      });
      const latencyTrends = Object.entries(dailyData).map(([date, data]) => ({
        date,
        avgLatency: data.count > 0 ? Math.round(data.totalLatency / data.count) : 0,
        queryCount: data.count
      }));

      // Phase 4 Function Breakdown
      const phase4Config = [
        { 
          queryType: 'portfolio_optimization', 
          functionName: 'optimize-portfolio', 
          displayName: 'Portfolio Optimization',
          color: 'emerald',
          icon: '🎯'
        },
        { 
          queryType: 'retirement_planning', 
          functionName: 'retirement-planner', 
          displayName: 'Retirement Planner',
          color: 'blue',
          icon: '📊'
        },
        { 
          queryType: 'budget_optimization', 
          functionName: 'optimize-budget-zbb', 
          displayName: 'Budget Optimization',
          color: 'violet',
          icon: '💰'
        },
      ];

      const phase4Functions: Phase4FunctionMetrics[] = phase4Config.map(config => {
        const functionItems = items.filter(item => 
          item.query_type === config.queryType
        );
        const count = functionItems.length;
        const avgLat = count > 0 
          ? Math.round(functionItems.reduce((s, i) => s + (i.response_time_ms || 0), 0) / count)
          : 0;
        const reasoningToks = functionItems.reduce((s, i) => 
          s + ((i as any).reasoning_tokens || 0), 0);
        const estCost = Number((count * DEEPSEEK_COST_PER_QUERY).toFixed(2));

        return {
          functionName: config.functionName,
          displayName: config.displayName,
          queryCount: count,
          avgLatency: avgLat,
          totalReasoningTokens: reasoningToks,
          estimatedCost: estCost,
          color: config.color,
          icon: config.icon,
        };
      });

      return {
        totalQueries,
        totalReasoningTokens,
        totalCompletionTokens,
        avgReasoningTokensPerQuery,
        reasoningToCompletionRatio,
        totalCost: deepseekCost,
        avgLatency,
        queryTypeDistribution,
        latencyTrends,
        costComparison: {
          deepseekCost,
          claudeEquivalentCost,
          savings,
          savingsPercentage
        },
        phase4Functions,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
