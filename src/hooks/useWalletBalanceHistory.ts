import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subMonths, subYears, format } from 'date-fns';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export const useWalletBalanceHistory = (walletId: string | undefined, timeframe: Timeframe) => {
  return useQuery({
    queryKey: ['wallet-balance-history', walletId, timeframe],
    queryFn: async () => {
      if (!walletId) return [];

      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case '1D':
          startDate = subDays(now, 1);
          break;
        case '1W':
          startDate = subDays(now, 7);
          break;
        case '1M':
          startDate = subMonths(now, 1);
          break;
        case '3M':
          startDate = subMonths(now, 3);
          break;
        case '1Y':
          startDate = subYears(now, 1);
          break;
      }

      const { data, error } = await supabase
        .from('wallet_balance_history')
        .select('*')
        .eq('wallet_id', walletId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // If no real data, generate mock data for demo
      if (!data || data.length === 0) {
        return generateMockData(timeframe, 6530.50); // Mock total balance
      }

      return data.map(item => ({
        date: new Date(item.recorded_at),
        balance: Number(item.total_balance_usd)
      }));
    },
    enabled: !!walletId,
  });
};

// Generate mock data for demo purposes
const generateMockData = (timeframe: Timeframe, currentBalance: number) => {
  const dataPoints = {
    '1D': 24,   // hourly
    '1W': 7,    // daily
    '1M': 30,   // daily
    '3M': 12,   // weekly
    '1Y': 52    // weekly
  }[timeframe];

  const data = [];
  const now = new Date();
  const volatility = 0.02; // 2% max change per point

  for (let i = dataPoints - 1; i >= 0; i--) {
    let date: Date;
    switch (timeframe) {
      case '1D':
        date = subDays(now, i / 24);
        break;
      case '1W':
        date = subDays(now, i);
        break;
      case '1M':
        date = subDays(now, i);
        break;
      case '3M':
        date = subDays(now, i * 7);
        break;
      case '1Y':
        date = subDays(now, i * 7);
        break;
    }

    // Generate slightly random but trending upward values
    const randomChange = (Math.random() - 0.4) * volatility;
    const balance = currentBalance * (1 - (dataPoints - i) * 0.01 + randomChange);

    data.push({
      date,
      balance: Math.max(0, balance)
    });
  }

  return data;
};
