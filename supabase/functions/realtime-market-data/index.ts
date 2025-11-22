import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let updateInterval: number | null = null;
  let activeSymbols: string[] = [];

  socket.onopen = () => {
    console.log("[Market Data WebSocket] Connection opened");
    socket.send(JSON.stringify({ type: 'connected', message: 'Real-time market data stream active' }));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'subscribe') {
        activeSymbols = message.symbols || [];
        console.log("[Market Data] Subscribed to symbols:", activeSymbols);
        
        // Start sending updates every 5 seconds
        if (updateInterval) clearInterval(updateInterval);
        
        updateInterval = setInterval(async () => {
          try {
            // Fetch latest market data from cache
            const { data: marketData } = await supabase
              .from('market_data_cache')
              .select('symbol, price, change_percent, volume, last_updated')
              .in('symbol', activeSymbols);

            if (marketData && marketData.length > 0) {
              socket.send(JSON.stringify({
                type: 'market_update',
                data: marketData,
                timestamp: new Date().toISOString()
              }));
            }
          } catch (error) {
            console.error("[Market Data] Error fetching data:", error);
          }
        }, 5000); // Update every 5 seconds

        // Send initial data immediately
        const { data: initialData } = await supabase
          .from('market_data_cache')
          .select('symbol, price, change_percent, volume, last_updated')
          .in('symbol', activeSymbols);

        if (initialData) {
          socket.send(JSON.stringify({
            type: 'market_update',
            data: initialData,
            timestamp: new Date().toISOString()
          }));
        }
      }
      
      if (message.type === 'unsubscribe') {
        if (updateInterval) {
          clearInterval(updateInterval);
          updateInterval = null;
        }
        activeSymbols = [];
        console.log("[Market Data] Unsubscribed from all symbols");
      }
      
      if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }

    } catch (error) {
      console.error("[Market Data WebSocket] Message error:", error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  };

  socket.onclose = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    console.log("[Market Data WebSocket] Connection closed");
  };

  socket.onerror = (error) => {
    console.error("[Market Data WebSocket] Error:", error);
  };

  return response;
});