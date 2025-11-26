import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BehaviorPattern {
  id: string;
  pattern_type: string;
  pattern_data: any;
  confidence_score: number;
  sample_size: number;
  first_detected_at: string;
  last_updated_at: string;
}

export function useBehavioralLearning() {
  const queryClient = useQueryClient();

  const { data: patterns, isLoading } = useQuery({
    queryKey: ['behavior-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_behavior_patterns')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      return data as BehaviorPattern[];
    },
  });

  const analyzePatterns = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('behavioral-learning', {
        body: { action: 'analyze' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-patterns'] });
    },
  });

  const recordEvent = useMutation({
    mutationFn: async ({
      event_type,
      event_data,
      prediction_id,
      was_accurate,
    }: {
      event_type: string;
      event_data?: any;
      prediction_id?: string;
      was_accurate?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('behavioral-learning', {
        body: {
          action: 'record_event',
          event_type,
          event_data,
          prediction_id,
          was_accurate,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  return {
    patterns,
    isLoading,
    analyzePatterns,
    recordEvent,
  };
}