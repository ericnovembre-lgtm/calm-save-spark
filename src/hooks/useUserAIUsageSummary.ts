import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyUsageTrend {
  date: string;
  analyses: number;
  savings: number;
}

export interface WeeklyUsageTrend {
  week: string;
  analyses: number;
  savings: number;
}

export interface UserAIUsageSummary {
  totalAnalyses: number;
  estimatedSavings: number;
  efficiencyPercent: number;
  featureBreakdown: {
    feature: string;
    count: number;
    icon: string;
  }[];
  dailyTrends: DailyUsageTrend[];
  weeklyTrends: WeeklyUsageTrend[];
}

const CLAUDE_BASELINE = 0.50;
const DEFAULT_COST = 0.02;

export function calculateSavings(totalQueries: number, actualCost: number): number {
  const claudeEquivalentCost = totalQueries * CLAUDE_BASELINE;
  return Math.max(0, claudeEquivalentCost - actualCost);
}

export function calculateEfficiency(items: { was_fallback?: boolean | null }[]): number {
  if (items.length === 0) return 100;
  const successfulQueries = items.filter(item => !item.was_fallback).length;
  return Math.round((successfulQueries / items.length) * 100);
}

export function categorizeQueryType(queryType: string): string {
  const type = (queryType || 'unknown').toLowerCase();
  if (type.includes('budget') || type.includes('optimization')) {
    return 'Budget Optimizations';
  } else if (type.includes('portfolio') || type.includes('investment')) {
    return 'Investment Analyses';
  } else if (type.includes('retirement')) {
    return 'Retirement Projections';
  }
  return 'Financial Insights';
}

export function useUserAIUsageSummary() {
  return useQuery({
    queryKey: ['user-ai-usage-summary'],
    queryFn: async (): Promise<UserAIUsageSummary> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get data from last 60 days for trends
      const now = new Date();
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: analytics, error } = await supabase
        .from('ai_model_routing_analytics')
        .select('query_type, model_used, estimated_cost, was_fallback, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const allItems = analytics || [];
      
      // Filter for current month stats
      const monthItems = allItems.filter(item => 
        new Date(item.created_at!) >= monthStart
      );

      const totalAnalyses = monthItems.length;
      const actualCost = monthItems.reduce((sum, item) => 
        sum + (item.estimated_cost || DEFAULT_COST), 0
      );
      const estimatedSavings = calculateSavings(totalAnalyses, actualCost);
      const efficiencyPercent = calculateEfficiency(monthItems);

      // Feature breakdown
      const featureMap: Record<string, { count: number; icon: string }> = {
        'Budget Optimizations': { count: 0, icon: '💰' },
        'Investment Analyses': { count: 0, icon: '📊' },
        'Retirement Projections': { count: 0, icon: '🎯' },
        'Financial Insights': { count: 0, icon: '✨' },
      };

      monthItems.forEach(item => {
        const category = categorizeQueryType(item.query_type);
        featureMap[category].count++;
      });

      const featureBreakdown = Object.entries(featureMap)
        .filter(([_, data]) => data.count > 0)
        .map(([feature, data]) => ({
          feature,
          count: data.count,
          icon: data.icon,
        }))
        .sort((a, b) => b.count - a.count);

      // Daily trends (last 14 days)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const dailyMap = new Map<string, { analyses: number; cost: number }>();
      
      // Initialize all 14 days
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { analyses: 0, cost: 0 });
      }

      allItems
        .filter(item => new Date(item.created_at!) >= fourteenDaysAgo)
        .forEach(item => {
          const dateStr = new Date(item.created_at!).toISOString().split('T')[0];
          const existing = dailyMap.get(dateStr) || { analyses: 0, cost: 0 };
          existing.analyses++;
          existing.cost += item.estimated_cost || DEFAULT_COST;
          dailyMap.set(dateStr, existing);
        });

      const dailyTrends: DailyUsageTrend[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          analyses: data.analyses,
          savings: Number(calculateSavings(data.analyses, data.cost).toFixed(2)),
        }));

      // Weekly trends (last 8 weeks)
      const weeklyMap = new Map<string, { analyses: number; cost: number }>();
      
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000);
        const weekStr = `W${getWeekNumber(weekStart)}`;
        weeklyMap.set(weekStr, { analyses: 0, cost: 0 });
      }

      allItems.forEach(item => {
        const itemDate = new Date(item.created_at!);
        const weekStr = `W${getWeekNumber(itemDate)}`;
        const existing = weeklyMap.get(weekStr);
        if (existing) {
          existing.analyses++;
          existing.cost += item.estimated_cost || DEFAULT_COST;
        }
      });

      const weeklyTrends: WeeklyUsageTrend[] = Array.from(weeklyMap.entries())
        .map(([week, data]) => ({
          week,
          analyses: data.analyses,
          savings: Number(calculateSavings(data.analyses, data.cost).toFixed(2)),
        }));

      return {
        totalAnalyses,
        estimatedSavings: Number(estimatedSavings.toFixed(2)),
        efficiencyPercent,
        featureBreakdown,
        dailyTrends,
        weeklyTrends,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
