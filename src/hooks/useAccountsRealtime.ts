import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAccountsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('[useAccountsRealtime] Setting up realtime subscription for user:', userId);

    const channel = supabase
      .channel('connected_accounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connected_accounts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useAccountsRealtime] Received update:', payload);

          // Invalidate accounts query to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
          
          // Also invalidate liquidity data since balances affect it
          queryClient.invalidateQueries({ queryKey: ['liquidity-data'] });

          // Show toast for balance updates
          if (payload.eventType === 'UPDATE') {
            const account = payload.new as any;
            toast.success('Account Updated', {
              description: `${account.institution_name} balance synced`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[useAccountsRealtime] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
