import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Detects if a transaction amount is higher than usual for this merchant
 * Returns true if amount > average * 1.5
 */
export function useHighSpendingDetection(
  merchant: string,
  amount: number,
  userId: string | undefined
) {
  const { data: avgAmount } = useQuery({
    queryKey: ['merchant-average', merchant, userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('merchant', merchant)
        .eq('user_id', userId)
        .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

      if (error || !data || data.length === 0) return null;

      const avg = Math.abs(data.reduce((sum, t) => sum + parseFloat(t.amount as any), 0) / data.length);
      return avg;
    },
    enabled: !!userId && !!merchant,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const isHighSpending = avgAmount ? Math.abs(amount) > avgAmount * 1.5 : false;
  
  return { isHighSpending, avgAmount };
}