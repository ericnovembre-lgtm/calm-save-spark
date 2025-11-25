import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  let symbols: string[] = [];
  let intervalId: number | null = null;

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'subscribe') {
        symbols = message.symbols || [];
        console.log('Subscribed to symbols:', symbols);
        
        // Start fetching data every 10 seconds
        if (intervalId) clearInterval(intervalId);
        
        const fetchData = async () => {
          if (symbols.length === 0) return;

          // Map symbols to CoinGecko coin IDs
          const symbolToCoinId = (symbol: string) => {
            const map: Record<string, string> = {
              'btc': 'bitcoin',
              'eth': 'ethereum',
              'usdt': 'tether',
              'usdc': 'usd-coin',
              'bnb': 'binancecoin',
              'ada': 'cardano',
              'doge': 'dogecoin',
              'xrp': 'ripple',
              'sol': 'solana',
              'dot': 'polkadot',
              'matic': 'matic-network',
              'avax': 'avalanche-2',
            };
            return map[symbol.toLowerCase()] || symbol.toLowerCase();
          };

          // Create comma-separated list of coin IDs for batch API call
          const coinIds = symbols.map(symbolToCoinId).join(',');

          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
            );

            if (!response.ok) {
              console.error('CoinGecko API error:', response.status);
              return;
            }

            const data = await response.json();

            // Process each symbol
            for (const symbol of symbols) {
              const coinId = symbolToCoinId(symbol);
              const priceData = data[coinId];
              
              if (priceData && priceData.usd) {
                const payload = {
                  symbol: symbol.toUpperCase(),
                  price: priceData.usd,
                  change: priceData.usd_24h_change || 0,
                  changePercent: priceData.usd_24h_change || 0,
                  volume: priceData.usd_24h_vol || 0,
                  timestamp: new Date().toISOString(),
                };

                // Update database
                await supabaseClient
                  .from('crypto_holdings')
                  .update({ 
                    current_price: payload.price,
                    updated_at: payload.timestamp 
                  })
                  .eq('symbol', symbol.toUpperCase());

                // Send update to client
                socket.send(JSON.stringify({
                  type: 'price_update',
                  data: payload
                }));
              }
            }
          } catch (error) {
            console.error('Error fetching crypto prices:', error);
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to fetch prices'
            }));
          }
        };

        // Initial fetch
        await fetchData();
        
        // Then fetch every 10 seconds
        intervalId = setInterval(fetchData, 10000);
        
      } else if (message.type === 'unsubscribe') {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        symbols = [];
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      socket.send(JSON.stringify({ type: 'error', message: errorMessage }));
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    if (intervalId) clearInterval(intervalId);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (intervalId) clearInterval(intervalId);
  };

  return response;
});