import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveChain } from './useActiveChain';

interface GasAlert {
  id: string;
  user_id: string;
  chain_id: string;
  threshold_gwei: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useGasAlerts() {
  const queryClient = useQueryClient();
  const { selectedChain } = useActiveChain();

  const { data: alert, isLoading } = useQuery({
    queryKey: ['gas-alert', selectedChain],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallet_gas_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain_id', selectedChain)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as GasAlert | null;
    },
  });

  const upsertAlert = useMutation({
    mutationFn: async ({ threshold_gwei, is_active }: { threshold_gwei: number; is_active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallet_gas_alerts')
        .upsert({
          user_id: user.id,
          chain_id: selectedChain,
          threshold_gwei,
          is_active,
        }, {
          onConflict: 'user_id,chain_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gas-alert', selectedChain] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallet_gas_alerts')
        .delete()
        .eq('user_id', user.id)
        .eq('chain_id', selectedChain);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gas-alert', selectedChain] });
    },
  });

  return {
    alert,
    isLoading,
    upsertAlert: upsertAlert.mutate,
    deleteAlert: deleteAlert.mutate,
    isUpdating: upsertAlert.isPending || deleteAlert.isPending,
  };
}
