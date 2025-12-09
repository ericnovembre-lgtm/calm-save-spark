import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountDetails {
  id: string;
  user_id: string;
  institution_name: string;
  account_type: string;
  account_mask: string | null;
  balance: number | null;
  available_balance: number | null;
  current_balance: number | null;
  currency: string | null;
  apy: number | null;
  nickname: string | null;
  last_synced: string | null;
  created_at: string | null;
}

export function useAccountDetails(accountId: string) {
  const { data: account, isLoading, error, refetch } = useQuery<AccountDetails | null>({
    queryKey: ['account-details', accountId],
    queryFn: async () => {
      if (!accountId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as AccountDetails;
    },
    enabled: !!accountId,
  });

  return {
    account,
    isLoading,
    error,
    refetch,
  };
}
