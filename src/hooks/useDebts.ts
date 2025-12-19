import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-config';
import { useMemo } from 'react';
import { useAlgoliaSync } from '@/hooks/useAlgoliaSync';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtInsert = Database['public']['Tables']['debts']['Insert'];
type DebtUpdate = Database['public']['Tables']['debts']['Update'];

export function useDebts() {
  const queryClient = useQueryClient();
  const { indexRecords, deleteRecords } = useAlgoliaSync();

  const { data: debts, isLoading, error } = useQuery({
    queryKey: queryKeys.debts(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('interest_rate', { ascending: false });

      if (error) throw error;
      return data as Debt[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data || [], // Transform at query level
  });

  // Memoize computed values
  const totalDebt = useMemo(() => {
    return debts?.reduce((sum, debt) => sum + debt.current_balance, 0) || 0;
  }, [debts]);

  const averageInterestRate = useMemo(() => {
    if (!debts || debts.length === 0) return 0;
    const sum = debts.reduce((total, debt) => total + debt.interest_rate, 0);
    return sum / debts.length;
  }, [debts]);

  const addDebtMutation = useMutation({
    mutationFn: async (debtData: Omit<DebtInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('debts')
        .insert([{ ...debtData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newDebt) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.debts() });
      const previous = queryClient.getQueryData(queryKeys.debts());
      
      queryClient.setQueryData(queryKeys.debts(), (old: Debt[] = []) => [
        ...old,
        { ...newDebt, id: 'temp-id', user_id: 'temp' } as Debt,
      ]);
      
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts() });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt added successfully');

      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'debts',
          records: [{
            objectID: data.id,
            debt_name: data.debt_name,
            debt_type: data.debt_type,
            current_balance: data.current_balance,
            interest_rate: data.interest_rate,
            minimum_payment: data.minimum_payment,
            status: data.status,
            is_active: data.is_active ?? true,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error, _newDebt, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.debts(), context.previous);
      }
      console.error('Error adding debt:', error);
      toast.error('Failed to add debt');
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DebtUpdate }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.debts() });
      const previous = queryClient.getQueryData(queryKeys.debts());
      
      queryClient.setQueryData(queryKeys.debts(), (old: Debt[] = []) =>
        old.map(debt => debt.id === id ? { ...debt, ...updates } : debt)
      );
      
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts() });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt updated successfully');

      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'debts',
          records: [{
            objectID: data.id,
            debt_name: data.debt_name,
            debt_type: data.debt_type,
            current_balance: data.current_balance,
            interest_rate: data.interest_rate,
            minimum_payment: data.minimum_payment,
            status: data.status,
            is_active: data.is_active ?? true,
            user_id: data.user_id,
          }]
        });
      }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.debts(), context.previous);
      }
      console.error('Error updating debt:', error);
      toast.error('Failed to update debt');
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.debts() });
      const previous = queryClient.getQueryData(queryKeys.debts());
      
      queryClient.setQueryData(queryKeys.debts(), (old: Debt[] = []) =>
        old.filter(debt => debt.id !== id)
      );
      
      return { previous };
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.debts() });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt removed successfully');

      // Remove from Algolia (debt is closed, not deleted)
      deleteRecords.mutate({
        indexName: 'debts',
        objectIDs: [id]
      });
    },
    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.debts(), context.previous);
      }
      console.error('Error deleting debt:', error);
      toast.error('Failed to delete debt');
    },
  });

  return {
    debts: debts || [],
    totalDebt,
    averageInterestRate,
    isLoading,
    error,
    addDebt: addDebtMutation.mutate,
    updateDebt: updateDebtMutation.mutate,
    deleteDebt: deleteDebtMutation.mutate,
    isAddingDebt: addDebtMutation.isPending,
    isUpdatingDebt: updateDebtMutation.isPending,
    isDeletingDebt: deleteDebtMutation.isPending,
  };
}
