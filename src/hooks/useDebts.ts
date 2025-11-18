import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtInsert = Database['public']['Tables']['debts']['Insert'];
type DebtUpdate = Database['public']['Tables']['debts']['Update'];

export function useDebts() {
  const queryClient = useQueryClient();

  const { data: debts, isLoading, error } = useQuery({
    queryKey: ['debts'],
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
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt added successfully');
    },
    onError: (error) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt updated successfully');
    },
    onError: (error) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt removed successfully');
    },
    onError: (error) => {
      console.error('Error deleting debt:', error);
      toast.error('Failed to delete debt');
    },
  });

  return {
    debts: debts || [],
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
