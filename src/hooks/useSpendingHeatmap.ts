import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, format, parseISO } from 'date-fns';

export interface HeatmapDataPoint {
  date: string;
  count: number; // transaction count
  amount: number; // total spending
  level: 0 | 1 | 2 | 3 | 4; // intensity level for visualization
}

export function useSpendingHeatmap(daysBack: number = 365) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['spending-heatmap', user?.id, daysBack],
    queryFn: async (): Promise<HeatmapDataPoint[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const endDate = new Date();
      const startDate = subDays(endDate, daysBack);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'))
        .lt('amount', 0); // Only expenses
      
      if (error) throw error;
      
      // Group by date
      const dailyData = new Map<string, { count: number; amount: number }>();
      
      (transactions || []).forEach(t => {
        const dateKey = t.transaction_date;
        const current = dailyData.get(dateKey) || { count: 0, amount: 0 };
        dailyData.set(dateKey, {
          count: current.count + 1,
          amount: current.amount + Math.abs(t.amount),
        });
      });
      
      // Calculate percentiles for level assignment
      const amounts = Array.from(dailyData.values()).map(d => d.amount);
      const sortedAmounts = [...amounts].sort((a, b) => a - b);
      
      const getPercentile = (p: number) => {
        if (sortedAmounts.length === 0) return 0;
        const index = Math.floor((p / 100) * sortedAmounts.length);
        return sortedAmounts[Math.min(index, sortedAmounts.length - 1)];
      };
      
      const p25 = getPercentile(25);
      const p50 = getPercentile(50);
      const p75 = getPercentile(75);
      
      const getLevel = (amount: number): 0 | 1 | 2 | 3 | 4 => {
        if (amount === 0) return 0;
        if (amount <= p25) return 1;
        if (amount <= p50) return 2;
        if (amount <= p75) return 3;
        return 4;
      };
      
      // Build heatmap data
      const heatmapData: HeatmapDataPoint[] = [];
      
      for (let i = daysBack; i >= 0; i--) {
        const date = format(subDays(endDate, i), 'yyyy-MM-dd');
        const data = dailyData.get(date) || { count: 0, amount: 0 };
        
        heatmapData.push({
          date,
          count: data.count,
          amount: data.amount,
          level: getLevel(data.amount),
        });
      }
      
      return heatmapData;
    },
    enabled: !!user?.id,
  });
}
