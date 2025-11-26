import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export function usePolygonMarkets(symbols: string[], refreshInterval = 5000) {
  const [data, setData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    if (symbols.length === 0) return;

    try {
      const { data: marketData, error: fetchError } = await supabase.functions.invoke(
        'polygon-market-data',
        {
          body: { symbols },
        }
      );

      if (fetchError) throw fetchError;

      setData(marketData.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      toast.error('Failed to fetch real-time market data');
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchMarketData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchMarketData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchMarketData, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchMarketData,
  };
}
