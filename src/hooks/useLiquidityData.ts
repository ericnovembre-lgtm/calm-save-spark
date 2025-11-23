import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiquidityData {
  totalCash: number;
  upcomingBills: number;
  safeToSpend: number;
  dailySpendAvg: number;
  runway: number;
}

export const useLiquidityData = () => {
  return useQuery({
    queryKey: ['liquidity-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-liquidity');

      if (error) throw error;
      return data as LiquidityData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};