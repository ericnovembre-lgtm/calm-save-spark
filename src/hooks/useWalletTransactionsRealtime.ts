import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletTransactionsRealtime = (walletId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!walletId) return;

    const channel = supabase
      .channel('wallet-transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `wallet_id=eq.${walletId}`
        },
        (payload) => {
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;

          // Status changed
          if (oldStatus !== newStatus) {
            if (newStatus === 'confirmed') {
              toast.success('✅ Transaction confirmed!', {
                description: `Your ${payload.new.transaction_type} transaction has been confirmed on the blockchain.`
              });
            } else if (newStatus === 'failed') {
              toast.error('❌ Transaction failed', {
                description: 'Your transaction could not be completed.'
              });
            }
          }

          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions', walletId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `wallet_id=eq.${walletId}`
        },
        (payload) => {
          toast.info('🔔 New transaction detected', {
            description: `${payload.new.transaction_type} transaction added to history`
          });
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions', walletId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletId, queryClient]);
};
