import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface RealtimeDataOptions {
  table: string;
  filter?: { column: string; value: any };
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeData({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: RealtimeDataOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create channel
        let newChannel = supabase.channel(`realtime:${table}:${user.id}`);

        // Subscribe to postgres changes
        let subscription = newChannel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
          },
          (payload) => {
            console.log(`Realtime ${payload.eventType}:`, payload);

            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(payload.new);
                toast.success('New data received', { duration: 2000 });
                break;
              case 'UPDATE':
                onUpdate?.(payload.new);
                break;
              case 'DELETE':
                onDelete?.(payload.old);
                break;
            }
          }
        );

        // Subscribe to channel
        subscription.subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          setIsConnected(status === 'SUBSCRIBED');
        });

        setChannel(newChannel);

        return () => {
          if (newChannel) {
            supabase.removeChannel(newChannel);
          }
        };
      } catch (error) {
        console.error('Realtime setup error:', error);
        toast.error('Failed to connect to real-time updates');
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter?.column, filter?.value]);

  return { isConnected, channel };
}

// Specialized hook for transaction updates
export function useRealtimeTransactions(userId: string, onNewTransaction?: (transaction: any) => void) {
  return useRealtimeData({
    table: 'transactions',
    filter: { column: 'user_id', value: userId },
    onInsert: (transaction) => {
      onNewTransaction?.(transaction);
      // Show notification
      const amount = Math.abs(transaction.amount);
      const type = transaction.amount > 0 ? 'deposit' : 'withdrawal';
      toast.info(`New ${type}: $${amount.toFixed(2)}`, {
        description: transaction.description || 'Transaction recorded',
        duration: 5000
      });
    }
  });
}

// Specialized hook for goal progress updates
export function useRealtimeGoals(userId: string, onGoalUpdate?: (goal: any) => void) {
  return useRealtimeData({
    table: 'goals',
    filter: { column: 'user_id', value: userId },
    onUpdate: (goal) => {
      onGoalUpdate?.(goal);
      // Celebrate milestones
      const progress = (goal.current_amount / goal.target_amount) * 100;
      if (progress >= 25 && progress < 30) {
        toast.success('🎉 25% milestone reached!', {
          description: `You're making great progress on "${goal.name}"!`
        });
      } else if (progress >= 50 && progress < 55) {
        toast.success('🎉 Halfway there!', {
          description: `You're 50% to your goal "${goal.name}"!`
        });
      } else if (progress >= 75 && progress < 80) {
        toast.success('🎉 75% complete!', {
          description: `Almost there on "${goal.name}"!`
        });
      } else if (progress >= 100) {
        toast.success('🎊 Goal Complete!', {
          description: `You've reached your goal "${goal.name}"!`,
          duration: 10000
        });
      }
    }
  });
}

// Specialized hook for budget alerts
export function useRealtimeBudgetAlerts(userId: string) {
  return useRealtimeData({
    table: 'budget_spending',
    filter: { column: 'user_id', value: userId },
    onUpdate: (spending) => {
      // Get budget limit
      const { budget_id, spent_amount } = spending;
      
      // Fetch budget details to check limit
      supabase
        .from('user_budgets')
        .select('total_limit, name')
        .eq('id', budget_id)
        .single()
        .then(({ data: budget }) => {
          if (!budget) return;
          
          const percentage = (spent_amount / budget.total_limit) * 100;
          
          if (percentage >= 90) {
            toast.error(`Budget Alert: ${budget.name}`, {
              description: `You've spent ${percentage.toFixed(0)}% of your budget!`,
              duration: 8000
            });
          } else if (percentage >= 75) {
            toast.warning(`Budget Warning: ${budget.name}`, {
              description: `You've spent ${percentage.toFixed(0)}% of your budget`,
              duration: 5000
            });
          }
        });
    }
  });
}
