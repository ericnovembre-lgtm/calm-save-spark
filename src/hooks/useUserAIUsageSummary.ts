import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserAIUsageSummary {
  totalAnalyses: number;
  estimatedSavings: number;
  efficiencyPercent: number;
  featureBreakdown: {
    feature: string;
    count: number;
    icon: string;
  }[];
}

export function useUserAIUsageSummary() {
  return useQuery({
    queryKey: ['user-ai-usage-summary'],
    queryFn: async (): Promise<UserAIUsageSummary> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current month start
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch user's AI analytics for this month
      const { data: analytics, error } = await supabase
        .from('ai_model_routing_analytics')
        .select('query_type, model_used, estimated_cost, was_fallback')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      if (error) throw error;

      const items = analytics || [];
      const totalAnalyses = items.length;

      // Calculate savings (difference between estimated Claude cost and actual)
      // Claude baseline: $0.50 per query, actual cost varies by model
      const CLAUDE_BASELINE = 0.50;
      const actualCost = items.reduce((sum, item) => sum + (item.estimated_cost || 0.02), 0);
      const claudeEquivalentCost = totalAnalyses * CLAUDE_BASELINE;
      const estimatedSavings = Math.max(0, claudeEquivalentCost - actualCost);

      // Calculate efficiency (successful queries without fallback)
      const successfulQueries = items.filter(item => !item.was_fallback).length;
      const efficiencyPercent = totalAnalyses > 0 
        ? Math.round((successfulQueries / totalAnalyses) * 100) 
        : 100;

      // Categorize into user-friendly features
      const featureMap: Record<string, { count: number; icon: string }> = {
        'Budget Optimizations': { count: 0, icon: '💰' },
        'Investment Analyses': { count: 0, icon: '📊' },
        'Retirement Projections': { count: 0, icon: '🎯' },
        'Financial Insights': { count: 0, icon: '✨' },
      };

      items.forEach(item => {
        const type = item.query_type || 'unknown';
        if (type.includes('budget') || type.includes('optimization')) {
          featureMap['Budget Optimizations'].count++;
        } else if (type.includes('portfolio') || type.includes('investment')) {
          featureMap['Investment Analyses'].count++;
        } else if (type.includes('retirement')) {
          featureMap['Retirement Projections'].count++;
        } else {
          featureMap['Financial Insights'].count++;
        }
      });

      const featureBreakdown = Object.entries(featureMap)
        .filter(([_, data]) => data.count > 0)
        .map(([feature, data]) => ({
          feature,
          count: data.count,
          icon: data.icon,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalAnalyses,
        estimatedSavings: Number(estimatedSavings.toFixed(2)),
        efficiencyPercent,
        featureBreakdown,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
