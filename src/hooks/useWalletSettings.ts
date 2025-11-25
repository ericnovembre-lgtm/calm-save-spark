import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WalletSettings {
  id: string;
  user_id: string;
  display_currency: string;
  hide_balance: boolean;
  hide_transaction_amounts: boolean;
  show_transaction_history: boolean;
  created_at: string;
  updated_at: string;
}

export function useWalletSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['wallet-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallet_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Return default settings if none exist
      if (!data) {
        return {
          display_currency: 'USD',
          hide_balance: false,
          hide_transaction_amounts: false,
          show_transaction_history: true,
        };
      }
      
      return data as WalletSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<WalletSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallet_settings')
        .upsert({
          user_id: user.id,
          ...updates,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-settings'] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
