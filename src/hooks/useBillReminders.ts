import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

export interface BillReminder {
  id: string;
  subscriptionId: string | null;
  reminderDate: string;
  reminderType: string | null;
  isSent: boolean;
}

export function useBillReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const remindersQuery = useQuery({
    queryKey: ['bill-reminders', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('subscription_reminders')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        subscriptionId: r.subscription_id,
        reminderDate: r.reminder_date,
        reminderType: r.reminder_type,
        isSent: r.is_sent ?? false,
      })) as BillReminder[];
    },
    enabled: !!user?.id,
  });
  
  const setReminder = useMutation({
    mutationFn: async ({ subscriptionId, daysBefore }: { subscriptionId: string; daysBefore: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const reminderDate = format(addDays(new Date(), daysBefore), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('subscription_reminders')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          reminder_date: reminderDate,
          reminder_type: 'bill_due',
          message: `Bill reminder set for ${daysBefore} days before due date`,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      toast.success('Reminder set');
    },
    onError: () => {
      toast.error('Failed to set reminder');
    },
  });
  
  const removeReminder = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('subscription_reminders')
        .delete()
        .eq('id', reminderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      toast.success('Reminder removed');
    },
    onError: () => {
      toast.error('Failed to remove reminder');
    },
  });
  
  return {
    reminders: remindersQuery.data || [],
    isLoading: remindersQuery.isLoading,
    setReminder,
    removeReminder,
  };
}
