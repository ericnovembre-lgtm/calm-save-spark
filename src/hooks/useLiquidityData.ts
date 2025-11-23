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
      console.log('[useLiquidityData] Invoking calculate-liquidity function...');
      
      const { data, error } = await supabase.functions.invoke('calculate-liquidity');

      console.log('[useLiquidityData] Response:', { data, error });

      if (error) {
        console.error('[useLiquidityData] Error:', error);
        throw error;
      }
      
      return data as LiquidityData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};