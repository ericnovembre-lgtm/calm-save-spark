import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DiaryMood = 'great' | 'good' | 'neutral' | 'stressed' | 'anxious';

export interface DiaryEntry {
  id: string;
  user_id: string;
  entry_date: string;
  title: string | null;
  content: string;
  mood: DiaryMood | null;
  mood_score: number | null;
  financial_event_type: string | null;
  amount_involved: number | null;
  tags: string[] | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateDiaryInput {
  entry_date?: string;
  title?: string;
  content: string;
  mood?: DiaryMood;
  mood_score?: number;
  financial_event_type?: string;
  amount_involved?: number;
  tags?: string[];
}

export function useDiaryEntries() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['diary-entries', userId],
    queryFn: async (): Promise<DiaryEntry[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('financial_diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return (data || []) as DiaryEntry[];
    },
    enabled: !!userId,
  });

  const createEntry = useMutation({
    mutationFn: async (input: CreateDiaryInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_diary_entries')
        .insert({
          user_id: userId,
          entry_date: input.entry_date || new Date().toISOString().split('T')[0],
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast.success('Diary entry saved');
    },
    onError: () => {
      toast.error('Failed to save diary entry');
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiaryEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_diary_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast.success('Entry updated');
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast.success('Entry deleted');
    },
  });

  return {
    entries: entries || [],
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}

export function useMoodAnalytics() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['mood-analytics', userId],
    queryFn: async () => {
      if (!userId) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('financial_diary_entries')
        .select('mood, mood_score, entry_date, amount_involved')
        .eq('user_id', userId)
        .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;

      const entries = data || [];
      const moodCounts: Record<string, number> = {};
      let totalScore = 0;
      let scoreCount = 0;
      let totalSpendingOnStress = 0;

      entries.forEach(entry => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
        if (entry.mood_score) {
          totalScore += entry.mood_score;
          scoreCount++;
        }
        if ((entry.mood === 'stressed' || entry.mood === 'anxious') && entry.amount_involved) {
          totalSpendingOnStress += Math.abs(entry.amount_involved);
        }
      });

      return {
        moodDistribution: moodCounts,
        averageMoodScore: scoreCount > 0 ? totalScore / scoreCount : null,
        totalEntries: entries.length,
        stressSpending: totalSpendingOnStress,
      };
    },
    enabled: !!userId,
  });
}