import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StreamTransaction {
  id: string;
  merchant: string;
  amount: number;
  category?: string;
  categoryIcon?: string;
  timestamp: Date;
  type: 'income' | 'expense';
  latencyMs?: number;
}

interface UseLiveTransactionStreamReturn {
  transactions: StreamTransaction[];
  isConnected: boolean;
  dismissTransaction: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

export function useLiveTransactionStream(maxTransactions = 10): UseLiveTransactionStreamReturn {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<StreamTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to real-time transactions
    const channel = supabase
      .channel('live-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const tx = payload.new as any;
          const streamTx: StreamTransaction = {
            id: tx.id,
            merchant: tx.merchant || tx.description || 'Unknown',
            amount: Math.abs(Number(tx.amount) || 0),
            category: tx.category,
            timestamp: new Date(tx.transaction_date || tx.created_at),
            type: Number(tx.amount) < 0 ? 'expense' : 'income',
            latencyMs: undefined, // Will be set if Groq categorization happens
          };
          
          setTransactions(prev => [streamTx, ...prev].slice(0, maxTransactions));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Also subscribe to wallet_notifications for Groq-processed alerts
    const alertChannel = supabase
      .channel('live-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as any;
          if (notif.notification_type === 'transaction_alert') {
            const metadata = notif.metadata as any;
            // Update existing transaction with Groq latency if available
            if (metadata?.transaction_id && metadata?.groq_latency_ms) {
              setTransactions(prev => 
                prev.map(tx => 
                  tx.id === metadata.transaction_id 
                    ? { ...tx, latencyMs: metadata.groq_latency_ms }
                    : tx
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(alertChannel);
    };
  }, [user?.id, maxTransactions]);

  const dismissTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, []);

  return {
    transactions,
    isConnected,
    dismissTransaction,
    clearAll,
    unreadCount: transactions.length,
  };
}
