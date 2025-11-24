import { useEffect, useState, useRef } from 'react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface UseMarketWebSocketReturn {
  data: Record<string, MarketData>;
  isConnected: boolean;
  error: string | null;
}

export function useMarketWebSocket(symbols: string[]): UseMarketWebSocketReturn {
  const [data, setData] = useState<Record<string, MarketData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    const connect = () => {
      try {
        const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
        if (!projectRef) {
          setError('Project reference not configured');
          return;
        }

        const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/realtime-market-ws`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
          
          // Subscribe to symbols
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: symbols
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'price_update') {
              setData(prev => ({
                ...prev,
                [message.data.symbol]: message.data
              }));
            } else if (message.type === 'error') {
              console.error('WebSocket error message:', message.message);
              setError(message.message);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setIsConnected(false);
          
          // Attempt reconnection after 5 seconds
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        };

      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbols.join(',')]);

  return { data, isConnected, error };
}