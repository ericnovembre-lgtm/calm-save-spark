import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAlgoliaSync } from '@/hooks/useAlgoliaSync';
import type { Database } from '@/integrations/supabase/types';

type UserBudget = Database['public']['Tables']['user_budgets']['Row'];
type UserBudgetInsert = Database['public']['Tables']['user_budgets']['Insert'];
type UserBudgetUpdate = Database['public']['Tables']['user_budgets']['Update'];

export function useBudgetMutations(userId?: string) {
  const queryClient = useQueryClient();
  const { indexRecords, deleteRecords } = useAlgoliaSync();

  const createBudget = useMutation({
    mutationFn: async (budgetData: Omit<UserBudgetInsert, 'user_id'>) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('user_budgets')
        .insert([{ ...budgetData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets', userId] });
      toast.success('Budget created successfully! 🎯');

      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'budgets',
          records: [{
            objectID: data.id,
            name: data.name,
            period: data.period,
            total_limit: data.total_limit,
            is_active: data.is_active ?? true,
            currency: data.currency,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UserBudgetUpdate }) => {
      const { data, error } = await supabase
        .from('user_budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets', userId] });
      toast.success('Budget updated! ✨');

      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'budgets',
          records: [{
            objectID: data.id,
            name: data.name,
            period: data.period,
            total_limit: data.total_limit,
            is_active: data.is_active ?? true,
            currency: data.currency,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('user_budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;
      return budgetId;
    },
    onSuccess: (budgetId) => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets', userId] });
      toast.success('Budget deleted');

      // Remove from Algolia
      deleteRecords.mutate({
        indexName: 'budgets',
        objectIDs: [budgetId]
      });
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    },
  });

  return {
    createBudget,
    updateBudget,
    deleteBudget,
    isCreating: createBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending,
  };
}
