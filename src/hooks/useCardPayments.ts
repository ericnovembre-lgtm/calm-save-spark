import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CardPayment = Database['public']['Tables']['card_payments']['Row'];
type CardAccount = Database['public']['Tables']['card_accounts']['Row'];

interface MakePaymentParams {
  accountId: string;
  amountCents: number;
  paymentMethod: string;
  statementId?: string;
  scheduledDate?: string;
  isAutopay?: boolean;
}

export function useCardPayments(accountId?: string) {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['card-payments', accountId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_id', accountId!)
        .order('payment_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CardPayment[];
    },
    enabled: !!accountId,
  });

  const makePayment = useMutation({
    mutationFn: async (params: MakePaymentParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const confirmationNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('card_payments')
        .insert({
          account_id: params.accountId,
          user_id: user.id,
          statement_id: params.statementId,
          amount_cents: params.amountCents,
          payment_method: params.paymentMethod,
          scheduled_date: params.scheduledDate,
          is_autopay: params.isAutopay || false,
          status: params.scheduledDate ? 'scheduled' : 'completed',
          confirmation_number: confirmationNumber,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update account balance if payment is immediate
      if (!params.scheduledDate) {
        const { data: account } = await supabase
          .from('card_accounts')
          .select('*')
          .eq('id', params.accountId)
          .single();

        if (account) {
          const newBalance = (account.current_balance_cents || 0) - params.amountCents;
          const newAvailable = account.credit_limit_cents - newBalance;

          await supabase
            .from('card_accounts')
            .update({
              current_balance_cents: Math.max(0, newBalance),
              available_cents: newAvailable,
            })
            .eq('id', params.accountId);
        }

        // Mark statement as paid if full balance paid
        if (params.statementId) {
          const { data: statement } = await supabase
            .from('card_statements')
            .select('new_balance_cents')
            .eq('id', params.statementId)
            .single();

          if (statement && params.amountCents >= statement.new_balance_cents) {
            await supabase
              .from('card_statements')
              .update({ is_paid: true, paid_at: new Date().toISOString() })
              .eq('id', params.statementId);
          }
        }
      }

      return payment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card-payments'] });
      queryClient.invalidateQueries({ queryKey: ['card_account'] });
      queryClient.invalidateQueries({ queryKey: ['card-statements'] });
      
      if (variables.scheduledDate) {
        toast.success('Payment scheduled successfully', {
          description: `Payment of $${(variables.amountCents / 100).toFixed(2)} scheduled for ${variables.scheduledDate}`,
        });
      } else {
        toast.success('Payment processed successfully', {
          description: `Payment of $${(variables.amountCents / 100).toFixed(2)} completed`,
        });
      }
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: 'Unable to process payment. Please try again.',
      });
    },
  });

  const updateAutopay = useMutation({
    mutationFn: async ({ accountId, enabled, amountType }: { 
      accountId: string; 
      enabled: boolean;
      amountType: 'minimum' | 'statement' | 'custom';
    }) => {
      const { error } = await supabase
        .from('card_accounts')
        .update({
          autopay_enabled: enabled,
          autopay_amount_type: amountType,
        })
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card_account'] });
      toast.success(
        variables.enabled ? 'Autopay enabled' : 'Autopay disabled',
        {
          description: variables.enabled 
            ? `Automatic payments will be made for ${variables.amountType} amount`
            : 'You will need to make manual payments',
        }
      );
    },
  });

  return {
    payments: payments || [],
    isLoading,
    error,
    makePayment: makePayment.mutate,
    isProcessing: makePayment.isPending,
    updateAutopay: updateAutopay.mutate,
    isUpdatingAutopay: updateAutopay.isPending,
  };
}
