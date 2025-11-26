import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";

interface NetWorthDataPoint {
  date: string;
  value: number;
}

export function useNetWorthData() {
  return useQuery({
    queryKey: ['net-worth-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current account balances
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('current_balance')
        .eq('user_id', user.id);

      // Get current debts
      const { data: debts } = await supabase
        .from('debts')
        .select('current_balance')
        .eq('user_id', user.id);

      const totalAssets = accounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
      const totalDebts = debts?.reduce((sum, debt) => sum + (debt.current_balance || 0), 0) || 0;
      const currentNetWorth = totalAssets - totalDebts;

      // Get historical data for trend (last 6 months)
      const sixMonthsAgo = subMonths(new Date(), 6);
      const { data: history } = await supabase
        .from('account_balance_history')
        .select('recorded_at, balance, account_id')
        .eq('user_id', user.id)
        .gte('recorded_at', sixMonthsAgo.toISOString())
        .order('recorded_at', { ascending: true });

      // Aggregate by month
      const monthlyData = new Map<string, number>();
      history?.forEach(record => {
        const monthKey = format(new Date(record.recorded_at), 'MMM yyyy');
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + record.balance);
      });

      const trendData: NetWorthDataPoint[] = Array.from(monthlyData.entries()).map(([date, value]) => ({
        date,
        value: value - totalDebts // Approximate net worth
      }));

      // Add current month
      trendData.push({
        date: format(new Date(), 'MMM yyyy'),
        value: currentNetWorth
      });

      // Calculate changes
      const previousMonth = trendData.length > 1 ? trendData[trendData.length - 2].value : currentNetWorth;
      const monthlyChange = currentNetWorth - previousMonth;
      const monthlyChangePercent = previousMonth > 0 ? (monthlyChange / previousMonth) * 100 : 0;

      const firstMonth = trendData[0]?.value || currentNetWorth;
      const ytdChange = currentNetWorth - firstMonth;
      const ytdChangePercent = firstMonth > 0 ? (ytdChange / firstMonth) * 100 : 0;

      return {
        currentNetWorth,
        totalAssets,
        totalDebts,
        monthlyChange,
        monthlyChangePercent,
        ytdChange,
        ytdChangePercent,
        trendData,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
