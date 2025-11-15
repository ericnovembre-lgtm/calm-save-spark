import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to enable real-time updates for budget data
 * Subscribes to changes in budget_spending and user_budgets tables
 */
export function useBudgetRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to budget_spending changes
    const spendingChannel = supabase
      .channel('budget_spending_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_spending',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Invalidate spending queries when data changes
          queryClient.invalidateQueries({ queryKey: ['budget_spending', userId] });
        }
      )
      .subscribe();

    // Subscribe to user_budgets changes
    const budgetsChannel = supabase
      .channel('user_budgets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_budgets',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Invalidate budgets queries when data changes
          queryClient.invalidateQueries({ queryKey: ['user_budgets', userId] });
        }
      )
      .subscribe();

    // Subscribe to transactions that affect budgets
    const transactionsChannel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Invalidate spending when transactions change
          queryClient.invalidateQueries({ queryKey: ['budget_spending', userId] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(spendingChannel);
      supabase.removeChannel(budgetsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [userId, queryClient]);
}
