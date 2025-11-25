import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CardSubscription {
  id: string;
  merchant_name: string;
  ai_merchant_name: string | null;
  amount_cents: number;
  frequency: string;
  next_expected_date: string | null;
  confidence: number;
  status: string;
  is_confirmed: boolean;
  cancel_reminder_enabled: boolean;
  cancel_reminder_days_before: number;
  category: string | null;
  zombie_score: number;
  last_charge_date: string | null;
}

export function useCardSubscriptions() {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['card_subscriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_expected_date', { ascending: true });

      if (error) throw error;
      return data as CardSubscription[];
    },
  });

  const detectSubscriptions = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('detect-card-subscriptions', {
        body: { userId: user.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['card_subscriptions'] });
      toast.success(`Detected ${data.detectedCount} subscriptions`, {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to detect subscriptions', {
        description: error.message,
      });
    },
  });

  const toggleReminder = useMutation({
    mutationFn: async ({ subscriptionId, enabled, daysBefore }: {
      subscriptionId: string;
      enabled: boolean;
      daysBefore: number;
    }) => {
      const { error } = await supabase
        .from('card_subscriptions')
        .update({
          cancel_reminder_enabled: enabled,
          cancel_reminder_days_before: daysBefore
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card_subscriptions'] });
      toast.success('Reminder settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update reminder', {
        description: error.message,
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ subscriptionId, status }: {
      subscriptionId: string;
      status: 'active' | 'paused' | 'cancelled';
    }) => {
      const { error } = await supabase
        .from('card_subscriptions')
        .update({ status })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card_subscriptions'] });
      toast.success('Subscription status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status', {
        description: error.message,
      });
    },
  });

  const confirmSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('card_subscriptions')
        .update({ is_confirmed: true })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card_subscriptions'] });
      toast.success('Subscription confirmed');
    },
  });

  const totalMonthly = subscriptions
    ?.filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const amount = sub.amount_cents / 100;
      if (sub.frequency === 'weekly') return sum + (amount * 4.33);
      if (sub.frequency === 'monthly') return sum + amount;
      if (sub.frequency === 'quarterly') return sum + (amount / 3);
      if (sub.frequency === 'yearly') return sum + (amount / 12);
      return sum;
    }, 0) || 0;

  return {
    subscriptions: subscriptions || [],
    isLoading,
    totalMonthly,
    detectSubscriptions: detectSubscriptions.mutate,
    isDetecting: detectSubscriptions.isPending,
    toggleReminder: toggleReminder.mutate,
    updateStatus: updateStatus.mutate,
    confirmSubscription: confirmSubscription.mutate,
  };
}