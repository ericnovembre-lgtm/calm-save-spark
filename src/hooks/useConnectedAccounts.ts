import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConnectedAccount {
  id: string;
  user_id: string;
  institution_name: string;
  account_type: string;
  balance: number | null;
  available_balance: number | null;
  current_balance: number | null;
  account_mask: string | null;
  created_at: string | null;
}

interface UseConnectedAccountsOptions {
  accountType?: string;
  minBalance?: number;
}

export function useConnectedAccounts(options?: UseConnectedAccountsOptions) {
  const { data: accounts, isLoading, error } = useQuery<ConnectedAccount[]>({
    queryKey: ['connected-accounts', options?.accountType, options?.minBalance],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const query = supabase
        .from('connected_accounts')
        .select('id, user_id, institution_name, account_type, balance, available_balance, current_balance, account_mask, created_at')
        .eq('user_id', user.id);

      const builder = options?.accountType 
        ? query.eq('account_type', options.accountType)
        : query;

      const { data, error } = await builder.order('created_at', { ascending: false });

      if (error) throw error;

      let filteredData = (data || []) as ConnectedAccount[];

      // Filter by minimum balance if specified
      if (options?.minBalance !== undefined) {
        filteredData = filteredData.filter(
          (account) => {
            const accountBalance = account.current_balance || account.balance || 0;
            return accountBalance >= options.minBalance!;
          }
        );
      }

      return filteredData;
    },
  });

  return {
    accounts: accounts || [],
    isLoading,
    error,
  };
}
