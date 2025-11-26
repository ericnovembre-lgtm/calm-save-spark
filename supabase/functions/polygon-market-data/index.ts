import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbols, timeframe = 'day' } = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      throw new Error('Symbols array is required');
    }

    const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');
    if (!POLYGON_API_KEY) {
      throw new Error('POLYGON_API_KEY not configured');
    }

    // Fetch real-time data for each symbol
    const marketData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // Get real-time quote
          const quoteResponse = await fetch(
            `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
          );
          
          if (!quoteResponse.ok) {
            console.error(`Failed to fetch quote for ${symbol}`);
            return null;
          }

          const quoteData = await quoteResponse.json();
          
          // Get previous close for change calculation
          const prevCloseResponse = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
          );
          
          const prevCloseData = await prevCloseResponse.json();
          const prevClose = prevCloseData.results?.[0]?.c || 0;
          const currentPrice = quoteData.results?.p || 0;
          const change = currentPrice - prevClose;
          const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

          return {
            symbol,
            price: currentPrice,
            change,
            changePercent,
            volume: quoteData.results?.s || 0,
            timestamp: new Date(quoteData.results?.t || Date.now()).toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out failed requests
    const validData = marketData.filter(data => data !== null);

    return new Response(
      JSON.stringify({ data: validData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in polygon-market-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
