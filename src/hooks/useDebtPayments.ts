import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DebtPayment = Database['public']['Tables']['debt_payment_history']['Row'];
type DebtPaymentInsert = Database['public']['Tables']['debt_payment_history']['Insert'];

export function useDebtPayments(debtId?: string) {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: debtId ? ['debt_payments', debtId] : ['debt_payments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('debt_payment_history')
        .select('*, debts(debt_name)')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (debtId) {
        query = query.eq('debt_id', debtId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DebtPayment[];
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData: Omit<DebtPaymentInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('debt_payment_history')
        .insert([{ ...paymentData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debt_payments'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    },
  });

  return {
    payments: payments || [],
    isLoading,
    error,
    addPayment: addPaymentMutation.mutate,
    isAddingPayment: addPaymentMutation.isPending,
  };
}
