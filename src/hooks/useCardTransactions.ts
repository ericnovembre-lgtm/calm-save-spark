import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardTransaction = Database['public']['Tables']['card_transactions']['Row'];

export function useCardTransactions(accountId?: string, cardId?: string) {
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['card_transactions', accountId, cardId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (cardId) {
        query = query.eq('card_id', cardId);
      } else if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CardTransaction[];
    },
    enabled: !!(accountId || cardId),
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
  };
}
