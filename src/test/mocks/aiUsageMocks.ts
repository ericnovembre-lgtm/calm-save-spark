import type { DailyUsageTrend, WeeklyUsageTrend, UserAIUsageSummary } from '@/hooks/useUserAIUsageSummary';

export interface MockAIAnalyticsRecord {
  id: string;
  user_id: string;
  query_type: string;
  model_used: string;
  estimated_cost: number | null;
  was_fallback: boolean | null;
  created_at: string;
}

export function createMockAIAnalyticsRecord(
  overrides?: Partial<MockAIAnalyticsRecord>
): MockAIAnalyticsRecord {
  return {
    id: crypto.randomUUID(),
    user_id: 'test-user-id',
    query_type: 'general',
    model_used: 'gemini-2.5-flash',
    estimated_cost: 0.02,
    was_fallback: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockBudgetAnalytics(): MockAIAnalyticsRecord {
  return createMockAIAnalyticsRecord({
    query_type: 'budget_optimization',
    model_used: 'deepseek-reasoner',
    estimated_cost: 0.01,
  });
}

export function createMockInvestmentAnalytics(): MockAIAnalyticsRecord {
  return createMockAIAnalyticsRecord({
    query_type: 'portfolio_analysis',
    model_used: 'deepseek-reasoner',
    estimated_cost: 0.015,
  });
}

export function createMockRetirementAnalytics(): MockAIAnalyticsRecord {
  return createMockAIAnalyticsRecord({
    query_type: 'retirement_planning',
    model_used: 'deepseek-reasoner',
    estimated_cost: 0.02,
  });
}

export function createMockFallbackAnalytics(): MockAIAnalyticsRecord {
  return createMockAIAnalyticsRecord({
    query_type: 'complex_analysis',
    model_used: 'gemini-2.5-flash',
    was_fallback: true,
    estimated_cost: 0.03,
  });
}

export function createMockDailyTrends(days: number = 14): DailyUsageTrend[] {
  const trends: DailyUsageTrend[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const analyses = Math.floor(Math.random() * 10) + 1;
    const savings = Number((analyses * 0.48).toFixed(2)); // ~$0.48 savings per query
    
    trends.push({
      date: date.toISOString().split('T')[0],
      analyses,
      savings,
    });
  }
  
  return trends;
}

export function createMockWeeklyTrends(weeks: number = 8): WeeklyUsageTrend[] {
  const trends: WeeklyUsageTrend[] = [];
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekNum = 52 - i; // Approximate week numbers
    const analyses = Math.floor(Math.random() * 50) + 10;
    const savings = Number((analyses * 0.48).toFixed(2));
    
    trends.push({
      week: `W${weekNum}`,
      analyses,
      savings,
    });
  }
  
  return trends;
}

export function createMockAIUsageSummary(
  overrides?: Partial<UserAIUsageSummary>
): UserAIUsageSummary {
  return {
    totalAnalyses: 47,
    estimatedSavings: 22.56,
    efficiencyPercent: 89,
    featureBreakdown: [
      { feature: 'Budget Optimizations', count: 18, icon: '💰' },
      { feature: 'Investment Analyses', count: 15, icon: '📊' },
      { feature: 'Retirement Projections', count: 8, icon: '🎯' },
      { feature: 'Financial Insights', count: 6, icon: '✨' },
    ],
    dailyTrends: createMockDailyTrends(14),
    weeklyTrends: createMockWeeklyTrends(8),
    ...overrides,
  };
}

export function createMockEmptyUsageSummary(): UserAIUsageSummary {
  return {
    totalAnalyses: 0,
    estimatedSavings: 0,
    efficiencyPercent: 100,
    featureBreakdown: [],
    dailyTrends: [],
    weeklyTrends: [],
  };
}

export function createMockAnalyticsRecordsForMonth(count: number): MockAIAnalyticsRecord[] {
  const records: MockAIAnalyticsRecord[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const queryTypes = [
    'budget_optimization',
    'portfolio_analysis', 
    'retirement_planning',
    'general_insight',
    'investment_recommendation',
  ];
  
  for (let i = 0; i < count; i++) {
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const createdAt = new Date(monthStart);
    createdAt.setDate(randomDay);
    
    records.push(createMockAIAnalyticsRecord({
      query_type: queryTypes[Math.floor(Math.random() * queryTypes.length)],
      created_at: createdAt.toISOString(),
      was_fallback: Math.random() < 0.1, // 10% fallback rate
      estimated_cost: 0.01 + Math.random() * 0.04,
    }));
  }
  
  return records;
}
