import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query-config';

export type Timeframe = '7d' | '30d' | '90d' | '6m' | '1y';

interface MonthlyData {
  month: string;
  spending: number;
  budget: number;
  status: 'over' | 'under' | 'on-track';
}

interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface AIInsight {
  id: string;
  type: 'trend' | 'alert' | 'upcoming' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  actionUrl?: string;
}

interface AnalyticsData {
  monthlyData: MonthlyData[];
  categoryTotals: CategoryTotal[];
  totalSpending: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  spendingChange: number;
  transactionChange: number;
  dailyData: { date: string; amount: number }[];
}

interface AIInsightsData {
  insights: AIInsight[];
  generatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Groceries': 'hsl(var(--chart-1))',
  'Dining': 'hsl(var(--chart-2))',
  'Transportation': 'hsl(var(--chart-3))',
  'Entertainment': 'hsl(var(--chart-4))',
  'Utilities': 'hsl(var(--chart-5))',
  'Shopping': 'hsl(var(--primary))',
  'Healthcare': 'hsl(142 76% 36%)',
  'Travel': 'hsl(262 83% 58%)',
  'Uncategorized': 'hsl(var(--muted-foreground))',
};

function getTimeframeParam(timeframe: Timeframe): string {
  switch (timeframe) {
    case '7d': return '7days';
    case '30d': return '30days';
    case '90d': return '3months';
    case '6m': return '6months';
    case '1y': return '1year';
    default: return '30days';
  }
}

function getTimeframeDays(timeframe: Timeframe): number {
  switch (timeframe) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '6m': return 180;
    case '1y': return 365;
    default: return 30;
  }
}

export function useAnalyticsData(timeframe: Timeframe = '30d') {
  return useQuery({
    queryKey: queryKeys.analytics(timeframe),
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const days = getTimeframeDays(timeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);

      // Fetch current period transactions
      const { data: currentTransactions, error: currentError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: true });

      if (currentError) throw currentError;

      // Fetch previous period transactions for comparison
      const { data: previousTransactions, error: previousError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', session.user.id)
        .gte('transaction_date', previousStartDate.toISOString())
        .lt('transaction_date', startDate.toISOString());

      if (previousError) throw previousError;

      const transactions = currentTransactions || [];
      const prevTransactions = previousTransactions || [];

      // Calculate totals
      const expenses = transactions.filter(t => t.amount < 0);
      const totalSpending = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const transactionCount = expenses.length;
      const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

      // Previous period totals
      const prevExpenses = prevTransactions.filter(t => t.amount < 0);
      const prevTotalSpending = prevExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const prevTransactionCount = prevExpenses.length;

      // Calculate changes
      const spendingChange = prevTotalSpending > 0 
        ? ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100 
        : 0;
      const transactionChange = prevTransactionCount > 0 
        ? ((transactionCount - prevTransactionCount) / prevTransactionCount) * 100 
        : 0;

      // Aggregate by category
      const categoryMap: Record<string, number> = {};
      expenses.forEach(t => {
        const category = t.category || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + Math.abs(t.amount);
      });

      const categoryTotals: CategoryTotal[] = Object.entries(categoryMap)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
          color: CATEGORY_COLORS[category] || 'hsl(var(--muted-foreground))',
        }))
        .sort((a, b) => b.amount - a.amount);

      const topCategory = categoryTotals[0]?.category || 'None';

      // Aggregate by month
      const monthlyMap: Record<string, number> = {};
      expenses.forEach(t => {
        const monthKey = t.transaction_date.substring(0, 7);
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Math.abs(t.amount);
      });

      const monthlyData: MonthlyData[] = Object.entries(monthlyMap)
        .map(([month, spending]) => ({
          month,
          spending,
          budget: 0,
          status: 'on-track' as const,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Aggregate by day for trend chart
      const dailyMap: Record<string, number> = {};
      expenses.forEach(t => {
        const dateKey = t.transaction_date.substring(0, 10);
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + Math.abs(t.amount);
      });

      const dailyData = Object.entries(dailyMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        monthlyData,
        categoryTotals,
        totalSpending,
        transactionCount,
        averageTransaction,
        topCategory,
        spendingChange,
        transactionChange,
        dailyData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAIInsights(timeframe: Timeframe = '30d') {
  return useQuery({
    queryKey: ['ai-insights', timeframe],
    queryFn: async (): Promise<AIInsightsData> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.user.id }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }

        const data = await response.json();
        return {
          insights: data.insights || [],
          generatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('AI Insights error:', error);
        // Return fallback insights
        return {
          insights: [
            {
              id: '1',
              type: 'tip',
              title: 'Start tracking',
              description: 'Add more transactions to get personalized AI insights about your spending habits.',
              severity: 'info',
            },
          ],
          generatedAt: new Date().toISOString(),
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
