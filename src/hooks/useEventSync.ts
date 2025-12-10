import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useEventSync() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const syncFromSubscriptions = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      // Get recurring transactions (subscriptions)
      const { data: subscriptions, error: subError } = await supabase
        .from('recurring_transactions')
        .select('id, merchant, avg_amount, category, expected_date')
        .eq('user_id', userId);

      if (subError) throw subError;

      // Create events for each subscription
      const events = (subscriptions || []).map((sub) => {
        // Calculate next date from expected_date (day of month)
        const now = new Date();
        const expectedDay = sub.expected_date || 1;
        let nextDate = new Date(now.getFullYear(), now.getMonth(), expectedDay);
        if (nextDate < now) {
          nextDate = new Date(now.getFullYear(), now.getMonth() + 1, expectedDay);
        }

        return {
          user_id: userId,
          event_type: 'subscription',
          title: sub.merchant || 'Subscription',
          description: sub.category,
          amount: sub.avg_amount,
          event_date: format(nextDate, 'yyyy-MM-dd'),
          source_id: sub.id,
          source_type: 'recurring_transaction',
          color: '#f59e0b',
        };
      });

      if (events.length > 0) {
        // Delete existing synced events first
        await supabase
          .from('financial_events')
          .delete()
          .eq('user_id', userId)
          .eq('source_type', 'recurring_transaction');

        const { error } = await supabase
          .from('financial_events')
          .insert(events);

        if (error) throw error;
      }

      return events.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
      toast.success(`Synced ${count} subscription events`);
    },
    onError: () => {
      toast.error('Failed to sync subscriptions');
    },
  });

  const syncFromGoals = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      // Get active goals with deadlines
      const { data: goals, error: goalError } = await supabase
        .from('goals')
        .select('id, name, target_amount, deadline')
        .eq('user_id', userId)
        .eq('is_active', true)
        .not('deadline', 'is', null);

      if (goalError) throw goalError;

      // Create milestone events
      const events = (goals || []).map((goal) => ({
        user_id: userId,
        event_type: 'goal_milestone',
        title: `Goal: ${goal.name}`,
        description: `Target: $${goal.target_amount}`,
        amount: goal.target_amount,
        event_date: goal.deadline,
        source_id: goal.id,
        source_type: 'goal',
        color: '#10b981',
      }));

      if (events.length > 0) {
        // Delete existing goal events first
        await supabase
          .from('financial_events')
          .delete()
          .eq('user_id', userId)
          .eq('source_type', 'goal');

        const { error } = await supabase
          .from('financial_events')
          .insert(events);

        if (error) throw error;
      }

      return events.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
      toast.success(`Synced ${count} goal milestones`);
    },
  });

  const syncAll = useMutation({
    mutationFn: async () => {
      await syncFromSubscriptions.mutateAsync();
      await syncFromGoals.mutateAsync();
    },
    onSuccess: () => {
      toast.success('Calendar synced with all sources');
    },
  });

  return {
    syncFromSubscriptions,
    syncFromGoals,
    syncAll,
    isSyncing: syncFromSubscriptions.isPending || syncFromGoals.isPending,
  };
}
