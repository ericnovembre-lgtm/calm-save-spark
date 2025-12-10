import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FinancialReminder {
  id: string;
  user_id: string;
  event_id: string | null;
  reminder_date: string;
  reminder_type: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

interface CreateReminderInput {
  event_id: string;
  reminder_date: string;
  reminder_type?: string;
}

export function useFinancialReminders() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['financial-reminders', userId],
    queryFn: async (): Promise<FinancialReminder[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('financial_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_date');

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const createReminder = useMutation({
    mutationFn: async (input: CreateReminderInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_reminders')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reminders'] });
      toast.success('Reminder set');
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reminders'] });
      toast.success('Reminder removed');
    },
  });

  return {
    reminders: reminders || [],
    isLoading,
    createReminder,
    deleteReminder,
  };
}
