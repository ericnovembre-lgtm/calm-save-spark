import { useState, useEffect, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SocialSentimentData } from './useSocialSentiment';

const WATCHLIST_KEY = 'sentiment-watchlist';
const DEFAULT_TICKERS = ['SPY', 'NVDA', 'AAPL', 'TSLA'];

export const useSentimentWatchlist = () => {
  const [tickers, setTickers] = useState<string[]>(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TICKERS;
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(tickers));
  }, [tickers]);

  const addTicker = useCallback((ticker: string) => {
    const normalized = ticker.toUpperCase().trim();
    if (normalized && !tickers.includes(normalized)) {
      setTickers(prev => [...prev, normalized]);
    }
  }, [tickers]);

  const removeTicker = useCallback((ticker: string) => {
    setTickers(prev => prev.filter(t => t !== ticker));
  }, []);

  const sentimentQueries = useQueries({
    queries: tickers.map(ticker => ({
      queryKey: ['social-sentiment', ticker],
      queryFn: async (): Promise<SocialSentimentData> => {
        const { data, error } = await supabase.functions.invoke('get-social-sentiment', {
          body: { ticker },
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    })),
  });

  const watchlistData = tickers.map((ticker, index) => ({
    ticker,
    data: sentimentQueries[index]?.data,
    isLoading: sentimentQueries[index]?.isLoading,
    error: sentimentQueries[index]?.error,
  }));

  const isLoading = sentimentQueries.some(q => q.isLoading);

  return {
    tickers,
    watchlistData,
    isLoading,
    addTicker,
    removeTicker,
  };
};
