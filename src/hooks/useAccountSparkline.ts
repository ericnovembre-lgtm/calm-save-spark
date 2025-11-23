import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAccountSparkline = (accountId: string) => {
  return useQuery({
    queryKey: ['account-sparkline', accountId],
    queryFn: async () => {
      // Get last 30 days of balance history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('account_balance_history')
        .select('balance, recorded_at')
        .eq('account_id', accountId)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (error) throw error;

      return data || [];
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    enabled: !!accountId,
  });
};