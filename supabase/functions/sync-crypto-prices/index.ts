import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Syncing crypto prices...');

    // Get unique crypto symbols from user holdings
    const { data: holdings } = await supabase
      .from('crypto_holdings')
      .select('symbol')
      .neq('symbol', '');

    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No crypto holdings to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uniqueSymbols = [...new Set(holdings.map(h => h.symbol))];

    // Fetch prices from CoinGecko API (free tier)
    const priceUpdates = [];
    for (const symbol of uniqueSymbols) {
      try {
        const coinId = symbol.toLowerCase() === 'btc' ? 'bitcoin' : 
                       symbol.toLowerCase() === 'eth' ? 'ethereum' :
                       symbol.toLowerCase() === 'usdt' ? 'tether' :
                       symbol.toLowerCase();

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
        );

        if (response.ok) {
          const data = await response.json();
          if (data[coinId]) {
            priceUpdates.push({
              symbol: symbol.toUpperCase(),
              price: data[coinId].usd,
              volume_24h: data[coinId].usd_24h_vol,
              market_cap: data[coinId].usd_market_cap,
              percent_change_24h: data[coinId].usd_24h_change
            });

            // Update user holdings with current price
            await supabase
              .from('crypto_holdings')
              .update({ current_price: data[coinId].usd, updated_at: new Date().toISOString() } as any)
              .eq('symbol', symbol.toUpperCase());
          }
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    }

    // Store price history
    if (priceUpdates.length > 0) {
      await supabase.from('crypto_price_history').insert(priceUpdates as any);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Crypto prices synced successfully',
        updated: priceUpdates.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing crypto prices:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});