import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export interface FinancialEvent {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  description: string | null;
  amount: number | null;
  event_date: string;
  recurrence_rule: string | null;
  source_id: string | null;
  source_type: string | null;
  color: string;
  is_completed: boolean;
  reminder_days: number;
  created_at: string;
  updated_at: string;
}

interface CreateEventInput {
  event_type: string;
  title: string;
  description?: string;
  amount?: number;
  event_date: string;
  recurrence_rule?: string;
  color?: string;
  reminder_days?: number;
}

export function useFinancialEvents(selectedDate?: Date) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const monthStart = selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date());
  const monthEnd = selectedDate ? endOfMonth(addMonths(selectedDate, 2)) : endOfMonth(addMonths(new Date(), 2));

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['financial-events', userId, format(monthStart, 'yyyy-MM')],
    queryFn: async (): Promise<FinancialEvent[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('financial_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('event_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('event_date');

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const createEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_events')
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
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
      toast.success('Event created');
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
      toast.success('Event updated');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
      toast.success('Event deleted');
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from('financial_events')
        .update({ is_completed })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-events'] });
    },
  });

  return {
    events: events || [],
    isLoading,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  };
}
