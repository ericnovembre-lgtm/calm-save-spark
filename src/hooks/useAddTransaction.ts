import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { transactionKeys } from '@/lib/query-keys';

interface NewTransaction {
  merchant: string;
  amount: number;
  category: string;
  transaction_date: string;
  description?: string;
  account_id?: string;
  enrichment_metadata?: any;
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: NewTransaction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          merchant: transaction.merchant,
          amount: transaction.amount,
          category: transaction.category,
          transaction_date: transaction.transaction_date,
          description: transaction.description,
          account_id: transaction.account_id,
          enrichment_metadata: transaction.enrichment_metadata as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: transactionKeys.lists() });

      queryClient.setQueriesData<any>({ queryKey: transactionKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        const tempTransaction = {
          id: 'temp-' + Date.now(),
          ...newTransaction,
          enrichment_metadata: { manually_added: true },
          connected_accounts: null,
        };

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any, i: number) =>
              i === 0
                ? { ...page, transactions: [tempTransaction, ...page.transactions] }
                : page
            ),
          };
        }

        return old;
      });

      return { previousData };
    },
    onError: (err, newTransaction, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: 'Failed to add transaction',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      toast({
        title: 'Transaction added',
        description: `${data.merchant} - $${Math.abs(data.amount).toFixed(2)}`,
      });
    },
  });
}
