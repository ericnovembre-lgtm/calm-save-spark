import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  frequency: string;
  next_expected_date: string;
  last_charge_date?: string;
  category?: string;
  status?: string;
  confidence?: number;
  confirmed?: boolean;
  paused_at?: string;
  paused_reason?: string;
  created_at?: string;
}

export function useSubscriptions() {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('detected_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_expected_date', { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const togglePauseMutation = useMutation({
    mutationFn: async (id: string) => {
      const sub = subscriptions?.find(s => s.id === id);
      if (!sub) throw new Error('Subscription not found');

      const newStatus = sub.status === 'active' ? 'paused' : 'active';
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('detected_subscriptions')
        .update({
          status: newStatus,
          paused_at: newStatus === 'paused' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;

      // Log event
      await supabase.from('subscription_events').insert({
        subscription_id: id,
        event_type: newStatus === 'paused' ? 'paused' : 'resumed',
        user_id: user.id,
      });

      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(newStatus === 'paused' ? 'Subscription paused' : 'Subscription resumed');
    },
    onError: (error) => {
      console.error('Error toggling subscription:', error);
      toast.error('Failed to update subscription');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Log cancellation event first
      await supabase.from('subscription_events').insert({
        subscription_id: id,
        event_type: 'cancelled',
        user_id: user.id,
      });

      const { error } = await supabase
        .from('detected_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription deleted');
    },
    onError: (error) => {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    },
  });

  // Computed values
  const activeBills = subscriptions?.filter(s => s.status !== 'paused') || [];
  const pausedBills = subscriptions?.filter(s => s.status === 'paused') || [];
  
  const upcomingBills = activeBills.filter(s => {
    const dueDate = new Date(s.next_expected_date);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return dueDate <= weekFromNow;
  });

  const overdueBills = activeBills.filter(s =>
    new Date(s.next_expected_date) < new Date()
  );

  const monthlyTotal = activeBills
    .filter(s => s.frequency === 'monthly')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return {
    subscriptions: subscriptions || [],
    activeBills,
    pausedBills,
    upcomingBills,
    overdueBills,
    monthlyTotal,
    isLoading,
    error,
    togglePause: togglePauseMutation.mutate,
    deleteSubscription: deleteMutation.mutate,
    isTogglingPause: togglePauseMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
