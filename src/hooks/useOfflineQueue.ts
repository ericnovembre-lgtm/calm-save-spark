import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QueuedTransaction {
  id: string;
  user_id: string;
  transaction_data: {
    amount: number;
    merchant: string;
    category?: string;
    transaction_date: string;
    notes?: string;
  };
  created_at: string;
  synced_at: string | null;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
  error_message?: string;
}

export function useOfflineQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueuedTransaction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing transactions...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Transactions will be queued.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch pending queue items
  const fetchQueue = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('offline_transaction_queue')
      .select('*')
      .eq('user_id', user.id)
      .in('sync_status', ['pending', 'failed'])
      .order('created_at', { ascending: true });

    if (!error && data) {
      setQueue(data as QueuedTransaction[]);
    }
  }, [user]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Add transaction to queue
  const addToQueue = useCallback(async (transactionData: QueuedTransaction['transaction_data']) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('offline_transaction_queue')
      .insert({
        user_id: user.id,
        transaction_data: transactionData,
        sync_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to queue transaction:', error);
      return null;
    }

    await fetchQueue();
    return data;
  }, [user, fetchQueue]);

  // Sync a single transaction
  const syncTransaction = useCallback(async (queueItem: QueuedTransaction) => {
    if (!user) return false;

    // Update status to syncing
    await supabase
      .from('offline_transaction_queue')
      .update({ sync_status: 'syncing' })
      .eq('id', queueItem.id);

    try {
      // Insert into actual transactions table
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: queueItem.transaction_data.amount,
          merchant: queueItem.transaction_data.merchant,
          category: queueItem.transaction_data.category || 'Uncategorized',
          transaction_date: queueItem.transaction_data.transaction_date,
          notes: queueItem.transaction_data.notes
        });

      if (txError) throw txError;

      // Mark as synced
      await supabase
        .from('offline_transaction_queue')
        .update({ 
          sync_status: 'synced',
          synced_at: new Date().toISOString()
        })
        .eq('id', queueItem.id);

      return true;
    } catch (error) {
      // Mark as failed
      await supabase
        .from('offline_transaction_queue')
        .update({ 
          sync_status: 'failed',
          retry_count: queueItem.retry_count + 1,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', queueItem.id);

      return false;
    }
  }, [user]);

  // Sync all pending transactions
  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing || queue.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of queue) {
      const success = await syncTransaction(item);
      if (success) successCount++;
      else failCount++;
    }

    await fetchQueue();
    setIsSyncing(false);

    if (successCount > 0) {
      toast.success(`Synced ${successCount} transaction${successCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to sync ${failCount} transaction${failCount > 1 ? 's' : ''}`);
    }
  }, [isOnline, isSyncing, queue, syncTransaction, fetchQueue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      syncAll();
    }
  }, [isOnline, queue.length, isSyncing, syncAll]);

  // Remove from queue
  const removeFromQueue = useCallback(async (id: string) => {
    await supabase
      .from('offline_transaction_queue')
      .delete()
      .eq('id', id);

    await fetchQueue();
  }, [fetchQueue]);

  // Clear all synced items
  const clearSynced = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('offline_transaction_queue')
      .delete()
      .eq('user_id', user.id)
      .eq('sync_status', 'synced');

    await fetchQueue();
  }, [user, fetchQueue]);

  return {
    queue,
    pendingCount: queue.filter(q => q.sync_status === 'pending').length,
    failedCount: queue.filter(q => q.sync_status === 'failed').length,
    isOnline,
    isSyncing,
    addToQueue,
    syncAll,
    removeFromQueue,
    clearSynced,
    refetch: fetchQueue
  };
}
