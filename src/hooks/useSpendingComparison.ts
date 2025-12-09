import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface MonthlyComparison {
  month: string;
  label: string;
  spending: number;
  income: number;
  netCashFlow: number;
}

export function useSpendingComparison(monthsToCompare: number = 6) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['spending-comparison', user?.id, monthsToCompare],
    queryFn: async (): Promise<MonthlyComparison[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const now = new Date();
      const comparisons: MonthlyComparison[] = [];
      
      // Get transactions for last N months
      const startDate = startOfMonth(subMonths(now, monthsToCompare - 1));
      const endDate = endOfMonth(now);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      // Group by month
      const monthlyData = new Map<string, { spending: number; income: number }>();
      
      (transactions || []).forEach(t => {
        const monthKey = t.transaction_date.substring(0, 7); // YYYY-MM
        const current = monthlyData.get(monthKey) || { spending: 0, income: 0 };
        
        if (t.amount < 0) {
          current.spending += Math.abs(t.amount);
        } else {
          current.income += t.amount;
        }
        
        monthlyData.set(monthKey, current);
      });
      
      // Build comparison array
      for (let i = monthsToCompare - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const label = format(monthDate, 'MMM yyyy');
        const data = monthlyData.get(monthKey) || { spending: 0, income: 0 };
        
        comparisons.push({
          month: monthKey,
          label,
          spending: data.spending,
          income: data.income,
          netCashFlow: data.income - data.spending,
        });
      }
      
      return comparisons;
    },
    enabled: !!user?.id,
  });
}
