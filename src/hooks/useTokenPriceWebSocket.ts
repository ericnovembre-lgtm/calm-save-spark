import { useState, useEffect, useRef } from 'react';

export interface TokenPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface UseTokenPriceWebSocketReturn {
  prices: Map<string, TokenPriceData>;
  isConnected: boolean;
  error: string | null;
}

/**
 * WebSocket hook for real-time crypto token price updates
 */
export function useTokenPriceWebSocket(symbols: string[]): UseTokenPriceWebSocketReturn {
  const [prices, setPrices] = useState<Map<string, TokenPriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-market-ws`;

    const connect = () => {
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log('[TokenPriceWS] Connected');
          setIsConnected(true);
          setError(null);

          // Subscribe to token symbols
          socket.send(JSON.stringify({
            type: 'subscribe',
            symbols: symbols
          }));
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'price_update' && message.data) {
              setPrices(prev => {
                const newPrices = new Map(prev);
                newPrices.set(message.data.symbol, message.data);
                return newPrices;
              });
            } else if (message.type === 'error') {
              console.error('[TokenPriceWS] Server error:', message.message);
              setError(message.message);
            }
          } catch (err) {
            console.error('[TokenPriceWS] Parse error:', err);
          }
        };

        socket.onclose = () => {
          console.log('[TokenPriceWS] Disconnected');
          setIsConnected(false);

          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('[TokenPriceWS] Reconnecting...');
            connect();
          }, 5000);
        };

        socket.onerror = (err) => {
          console.error('[TokenPriceWS] Error:', err);
          setError('WebSocket connection error');
          setIsConnected(false);
        };
      } catch (err) {
        console.error('[TokenPriceWS] Connect error:', err);
        setError('Failed to connect to price feed');
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        socketRef.current.close();
      }
    };
  }, [symbols.join(',')]);

  return { prices, isConnected, error };
}
