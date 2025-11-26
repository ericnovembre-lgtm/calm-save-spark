import { usePolygonMarkets } from './usePolygonMarkets';

// Default watchlist symbols for wealth tracking
const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'BND', 'GLD', 'VTI'];

export function useRealtimeMarketData(symbols: string[] = DEFAULT_SYMBOLS) {
  return usePolygonMarkets(symbols, 10000); // Update every 10 seconds
}
