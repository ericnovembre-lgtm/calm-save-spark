import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardStatement = Database['public']['Tables']['card_statements']['Row'];

export function useCardStatements(accountId?: string) {
  const queryClient = useQueryClient();

  const { data: statements, isLoading, error } = useQuery({
    queryKey: ['card-statements', accountId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_statements')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_id', accountId!)
        .order('statement_date', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as CardStatement[];
    },
    enabled: !!accountId,
  });

  const generateStatement = useMutation({
    mutationFn: async (accountId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get account details
      const { data: account } = await supabase
        .from('card_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) throw new Error('Account not found');

      // Calculate statement period
      const today = new Date();
      const statementDate = new Date(today.getFullYear(), today.getMonth(), account.billing_cycle_day || 1);
      const dueDate = new Date(statementDate);
      dueDate.setDate(dueDate.getDate() + 21);

      // Get transactions for the period
      const periodStart = new Date(statementDate);
      periodStart.setMonth(periodStart.getMonth() - 1);

      const { data: transactions } = await supabase
        .from('card_transactions')
        .select('*')
        .eq('account_id', accountId)
        .gte('transaction_date', periodStart.toISOString())
        .lt('transaction_date', statementDate.toISOString());

      const purchases = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount_cents), 0) || 0;

      // Create statement
      const { data: statement, error } = await supabase
        .from('card_statements')
        .insert({
          account_id: accountId,
          user_id: user.id,
          statement_date: statementDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          previous_balance_cents: 0,
          purchases_cents: purchases,
          new_balance_cents: purchases,
          minimum_payment_cents: Math.max(2500, Math.floor(purchases * 0.02)),
          credit_limit_cents: account.credit_limit_cents,
          available_credit_cents: account.available_cents,
        })
        .select()
        .single();

      if (error) throw error;
      return statement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-statements'] });
    },
  });

  return {
    statements: statements || [],
    isLoading,
    error,
    generateStatement: generateStatement.mutate,
    isGenerating: generateStatement.isPending,
  };
}
