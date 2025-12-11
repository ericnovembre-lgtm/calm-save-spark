import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlgoliaSync } from './useAlgoliaSync';
import { toast } from 'sonner';

interface CreateTransactionParams {
  merchant: string;
  amount: number;
  category?: string;
  description?: string;
  transaction_date?: string;
}

interface UpdateTransactionParams {
  id: string;
  data: Partial<{
    merchant: string;
    amount: number;
    category: string;
    description: string;
    transaction_date: string;
  }>;
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { indexRecords, deleteRecords } = useAlgoliaSync();

  const createTransaction = useMutation({
    mutationFn: async (transaction: CreateTransactionParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          merchant: transaction.merchant,
          amount: transaction.amount,
          category: transaction.category || 'Other',
          description: transaction.description || null,
          transaction_date: transaction.transaction_date || new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'transactions',
          records: [{
            objectID: data.id,
            merchant: data.merchant || '',
            amount: data.amount,
            category: data.category,
            description: data.description,
            transaction_date: data.transaction_date,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to create transaction', { description: error.message });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, data }: UpdateTransactionParams) => {
      const { data: updated, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'transactions',
          records: [{
            objectID: data.id,
            merchant: data.merchant || '',
            amount: data.amount,
            category: data.category,
            description: data.description,
            transaction_date: data.transaction_date,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to update transaction', { description: error.message });
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
      if (error) throw error;
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Remove from Algolia
      deleteRecords.mutate({
        indexName: 'transactions',
        objectIDs: [transactionId]
      });
    },
    onError: (error) => {
      toast.error('Failed to delete transaction', { description: error.message });
    }
  });

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
  };
}
