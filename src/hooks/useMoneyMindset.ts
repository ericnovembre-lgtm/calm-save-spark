import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type MindsetEntryType = 'reflection' | 'belief' | 'goal_statement' | 'affirmation';

export interface MindsetEntry {
  id: string;
  user_id: string;
  entry_type: MindsetEntryType;
  title: string;
  content: string;
  mood_score: number | null;
  tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMindsetEntryInput {
  entry_type: MindsetEntryType;
  title: string;
  content: string;
  mood_score?: number;
  tags?: string[];
  is_private?: boolean;
}

export function useMoneyMindset() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['money-mindset-entries', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('money_mindset_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MindsetEntry[];
    },
    enabled: !!session?.user?.id,
  });

  const createEntry = useMutation({
    mutationFn: async (input: CreateMindsetEntryInput) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('money_mindset_entries')
        .insert({
          user_id: session.user.id,
          ...input,
          tags: input.tags || [],
          is_private: input.is_private ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['money-mindset-entries'] });
      toast.success('Entry saved');
    },
    onError: (error) => {
      toast.error('Failed to save entry');
      console.error(error);
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MindsetEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('money_mindset_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['money-mindset-entries'] });
      toast.success('Entry updated');
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('money_mindset_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['money-mindset-entries'] });
      toast.success('Entry deleted');
    },
  });

  // Calculate mood trends
  const moodTrend = entries?.filter(e => e.mood_score !== null)
    .slice(0, 7)
    .map(e => ({ date: e.created_at, score: e.mood_score! })) || [];

  const averageMood = moodTrend.length > 0
    ? moodTrend.reduce((acc, m) => acc + m.score, 0) / moodTrend.length
    : null;

  // Group by type
  const entriesByType = entries?.reduce((acc, entry) => {
    if (!acc[entry.entry_type]) acc[entry.entry_type] = [];
    acc[entry.entry_type].push(entry);
    return acc;
  }, {} as Record<MindsetEntryType, MindsetEntry[]>) || {};

  return {
    entries: entries || [],
    entriesByType,
    moodTrend,
    averageMood,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
