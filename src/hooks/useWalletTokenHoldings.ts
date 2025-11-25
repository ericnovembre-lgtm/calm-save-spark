import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  current_price: number | null;
  purchase_price: number | null;
  wallet_address: string | null;
  exchange: string | null;
}

/**
 * Fetch user's actual crypto token holdings from the database
 */
export function useWalletTokenHoldings(walletAddress?: string) {
  return useQuery({
    queryKey: ['wallet-token-holdings', walletAddress],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const query = supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', user.id);

      if (walletAddress) {
        query.eq('wallet_address', walletAddress);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as TokenHolding[];
    },
    enabled: true,
  });
}
