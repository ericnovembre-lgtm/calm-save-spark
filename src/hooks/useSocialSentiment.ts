import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SocialSentimentData {
  ticker: string;
  sentiment: {
    score: number;
    label: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
    confidence: number;
  };
  volume: 'low' | 'moderate' | 'high' | 'viral';
  trendingTopics: string[];
  lastUpdated: string;
  source: 'grok';
}

interface UseSocialSentimentOptions {
  ticker?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useSocialSentiment = ({
  ticker = 'market',
  enabled = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutes default
}: UseSocialSentimentOptions = {}) => {
  return useQuery({
    queryKey: ['social-sentiment', ticker],
    queryFn: async (): Promise<SocialSentimentData> => {
      const { data, error } = await supabase.functions.invoke('get-social-sentiment', {
        body: { ticker },
      });

      if (error) {
        console.error('Error fetching social sentiment:', error);
        throw error;
      }

      return data;
    },
    enabled,
    refetchInterval,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });
};
