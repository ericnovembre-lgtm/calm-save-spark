import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChainConfig {
  id: string;
  chain_id: string;
  chain_name: string;
  rpc_url: string;
  explorer_url: string;
  native_currency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export function useChainConfigs() {
  const { data: chains, isLoading } = useQuery({
    queryKey: ['chain-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_chain_configs')
        .select('*')
        .eq('is_active', true)
        .order('chain_name');

      if (error) throw error;
      return data as ChainConfig[];
    },
  });

  return {
    chains: chains || [],
    isLoading,
  };
}