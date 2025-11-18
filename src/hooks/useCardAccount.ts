import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardAccount = Database['public']['Tables']['card_accounts']['Row'];

export function useCardAccount() {
  const { data: account, isLoading, error } = useQuery({
    queryKey: ['card_account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_accounts')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'pending'])
        .maybeSingle();

      if (error) throw error;
      return data as CardAccount | null;
    },
  });

  return {
    account,
    isLoading,
    error,
    hasAccount: !!account,
  };
}
