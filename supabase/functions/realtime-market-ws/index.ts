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
          if (!ALPHA_VANTAGE_API_KEY || symbols.length === 0) return;

          // Fetch one symbol at a time to avoid rate limits
          for (const symbol of symbols.slice(0, 1)) {
            try {
              const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
              );

              const data = await response.json();
              const quote = data['Global Quote'];
              
              if (quote && quote['05. price']) {
                const priceData = {
                  symbol,
                  price: parseFloat(quote['05. price']),
                  change: parseFloat(quote['09. change']),
                  changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                  volume: parseInt(quote['06. volume'] || '0'),
                  timestamp: new Date().toISOString(),
                };

                // Update database
                await supabaseClient
                  .from('market_data_cache')
                  .upsert({
                    symbol,
                    current_price: priceData.price,
                    change_amount: priceData.change,
                    change_percent: priceData.changePercent,
                    volume: priceData.volume,
                    last_updated: priceData.timestamp,
                  }, {
                    onConflict: 'symbol'
                  });

                // Send update to client
                socket.send(JSON.stringify({
                  type: 'price_update',
                  data: priceData
                }));
              }
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
            }
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