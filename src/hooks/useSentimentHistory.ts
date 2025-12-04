import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SentimentHistoryPoint {
  date: string;
  score: number;
  volume: 'low' | 'moderate' | 'high' | 'viral';
  confidence: number;
}

interface UseSentimentHistoryOptions {
  ticker: string;
  range?: '7d' | '30d';
  enabled?: boolean;
}

export const useSentimentHistory = ({
  ticker,
  range = '7d',
  enabled = true,
}: UseSentimentHistoryOptions) => {
  return useQuery({
    queryKey: ['sentiment-history', ticker, range],
    queryFn: async (): Promise<SentimentHistoryPoint[]> => {
      const { data, error } = await supabase.functions.invoke('get-social-sentiment', {
        body: { ticker, action: 'history', range },
      });

      if (error) {
        console.error('Error fetching sentiment history:', error);
        throw error;
      }

      return data.history || [];
    },
    enabled: enabled && !!ticker,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
