import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend: 'up' | 'down' | 'stable';
  previousAmount: number;
}

export interface MerchantSpending {
  merchant: string;
  amount: number;
  transactionCount: number;
  category: string;
  lastTransaction: Date;
}

export interface SpendingReportsData {
  totalSpending: number;
  previousPeriodSpending: number;
  changePercent: number;
  categoryBreakdown: CategorySpending[];
  topMerchants: MerchantSpending[];
  transactionCount: number;
  averageTransaction: number;
}

function getDateRange(timeRange: TimeRange): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  let start: Date, end: Date, prevStart: Date, prevEnd: Date;
  
  switch (timeRange) {
    case 'week':
      end = now;
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      prevEnd = new Date(start);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 7);
      break;
    case 'month':
      end = endOfMonth(now);
      start = startOfMonth(now);
      prevEnd = endOfMonth(subMonths(now, 1));
      prevStart = startOfMonth(subMonths(now, 1));
      break;
    case 'quarter':
      end = now;
      start = subMonths(now, 3);
      prevEnd = new Date(start);
      prevStart = subMonths(prevEnd, 3);
      break;
    case 'year':
      end = now;
      start = subMonths(now, 12);
      prevEnd = new Date(start);
      prevStart = subMonths(prevEnd, 12);
      break;
  }
  
  return { start, end, prevStart, prevEnd };
}

export function useSpendingReports(timeRange: TimeRange) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['spending-reports', user?.id, timeRange],
    queryFn: async (): Promise<SpendingReportsData> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { start, end, prevStart, prevEnd } = getDateRange(timeRange);
      
      // Fetch current period transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', format(start, 'yyyy-MM-dd'))
        .lte('transaction_date', format(end, 'yyyy-MM-dd'))
        .lt('amount', 0); // Only expenses
      
      if (error) throw error;
      
      // Fetch previous period transactions
      const { data: prevTransactions, error: prevError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', format(prevStart, 'yyyy-MM-dd'))
        .lte('transaction_date', format(prevEnd, 'yyyy-MM-dd'))
        .lt('amount', 0);
      
      if (prevError) throw prevError;
      
      const txns = transactions || [];
      const prevTxns = prevTransactions || [];
      
      // Calculate totals (convert to positive for display)
      const totalSpending = Math.abs(txns.reduce((sum, t) => sum + t.amount, 0));
      const previousPeriodSpending = Math.abs(prevTxns.reduce((sum, t) => sum + t.amount, 0));
      const changePercent = previousPeriodSpending > 0 
        ? ((totalSpending - previousPeriodSpending) / previousPeriodSpending) * 100 
        : 0;
      
      // Group by category
      const categoryMap = new Map<string, { amount: number; count: number }>();
      const prevCategoryMap = new Map<string, number>();
      
      txns.forEach(t => {
        const cat = t.category || 'Other';
        const current = categoryMap.get(cat) || { amount: 0, count: 0 };
        categoryMap.set(cat, { 
          amount: current.amount + Math.abs(t.amount), 
          count: current.count + 1 
        });
      });
      
      prevTxns.forEach(t => {
        const cat = t.category || 'Other';
        prevCategoryMap.set(cat, (prevCategoryMap.get(cat) || 0) + Math.abs(t.amount));
      });
      
      const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
        .map(([category, data]) => {
          const prevAmount = prevCategoryMap.get(category) || 0;
          const diff = data.amount - prevAmount;
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (diff > prevAmount * 0.05) trend = 'up';
          if (diff < -prevAmount * 0.05) trend = 'down';
          
          return {
            category,
            amount: data.amount,
            percentage: totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
            transactionCount: data.count,
            trend,
            previousAmount: prevAmount,
          };
        })
        .sort((a, b) => b.amount - a.amount);
      
      // Group by merchant
      const merchantMap = new Map<string, { amount: number; count: number; category: string; lastDate: string }>();
      
      txns.forEach(t => {
        const merchant = t.merchant || 'Unknown';
        const current = merchantMap.get(merchant);
        if (!current || t.transaction_date > current.lastDate) {
          merchantMap.set(merchant, {
            amount: (current?.amount || 0) + Math.abs(t.amount),
            count: (current?.count || 0) + 1,
            category: t.category,
            lastDate: t.transaction_date,
          });
        } else {
          merchantMap.set(merchant, {
            ...current,
            amount: current.amount + Math.abs(t.amount),
            count: current.count + 1,
          });
        }
      });
      
      const topMerchants: MerchantSpending[] = Array.from(merchantMap.entries())
        .map(([merchant, data]) => ({
          merchant,
          amount: data.amount,
          transactionCount: data.count,
          category: data.category,
          lastTransaction: parseISO(data.lastDate),
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
      
      return {
        totalSpending,
        previousPeriodSpending,
        changePercent,
        categoryBreakdown,
        topMerchants,
        transactionCount: txns.length,
        averageTransaction: txns.length > 0 ? totalSpending / txns.length : 0,
      };
    },
    enabled: !!user?.id,
  });
}
