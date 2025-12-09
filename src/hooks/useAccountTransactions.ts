import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountTransaction {
  id: string;
  description: string;
  amount: number;
  merchant?: string | null;
  transaction_date: string;
  category: string | null;
  pending: boolean | null;
}

export function useAccountTransactions(accountId: string, limit: number = 50) {
  const { data: transactions, isLoading, error, refetch } = useQuery<AccountTransaction[]>({
    queryKey: ['account-transactions', accountId, limit],
    queryFn: async () => {
      if (!accountId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('id, description, amount, transaction_date, category, pending, merchant')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AccountTransaction[];
    },
    enabled: !!accountId,
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    refetch,
  };
}
