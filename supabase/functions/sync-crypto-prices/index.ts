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
      console.log('No crypto holdings found to sync');
      return new Response(
        JSON.stringify({ message: 'No crypto holdings to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uniqueSymbols = [...new Set(holdings.map(h => h.symbol))];
    console.log(`Syncing prices for ${uniqueSymbols.length} unique symbols`);

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
        'dot': 'polkadot'
      };
      return map[symbol.toLowerCase()] || symbol.toLowerCase();
    };

    // Create comma-separated list of all coin IDs for batch API call
    const coinIds = uniqueSymbols.map(symbolToCoinId).join(',');

    // Declare arrays at function level for scope
    const priceUpdates: any[] = [];
    const updatePromises: PromiseLike<any>[] = [];

    try {
      // OPTIMIZATION: Single batch API call instead of loop
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Process all symbols from the batch response
      for (const symbol of uniqueSymbols) {
        const coinId = symbolToCoinId(symbol);
        const priceData = data[coinId];

        if (priceData && priceData.usd) {
          priceUpdates.push({
            symbol: symbol.toUpperCase(),
            price: priceData.usd,
            volume_24h: priceData.usd_24h_vol,
            market_cap: priceData.usd_market_cap,
            percent_change_24h: priceData.usd_24h_change
          });

          // Batch update user holdings (parallel)
          updatePromises.push(
            supabase
              .from('crypto_holdings')
              .update({ 
                current_price: priceData.usd, 
                updated_at: new Date().toISOString() 
              } as any)
              .eq('symbol', symbol.toUpperCase())
              .then()
          );
        } else {
          console.warn(`No price data found for ${symbol} (${coinId})`);
        }
      }

      // Execute all updates in parallel
      await Promise.all(updatePromises);
      
      console.log(`Successfully updated ${priceUpdates.length} crypto prices`);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      throw error;
    }

    // Store price history
    if (priceUpdates.length > 0) {
      await supabase.from('crypto_price_history').insert(priceUpdates as any);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Crypto prices synced successfully',
        updated: priceUpdates.length,
        symbols: uniqueSymbols.length
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