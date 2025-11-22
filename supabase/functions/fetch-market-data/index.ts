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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    // Get unique symbols from all user holdings
    const { data: holdings } = await supabaseClient
      .from('portfolio_holdings')
      .select('symbol')
      .not('symbol', 'is', null);

    const uniqueSymbols = [...new Set(holdings?.map(h => h.symbol) || [])];
    console.log(`Fetching data for ${uniqueSymbols.length} symbols`);

    let updatedCount = 0;
    let rateLimitHit = false;

    // Process symbols (Alpha Vantage free tier: 5 calls/min, 500/day)
    for (const symbol of uniqueSymbols.slice(0, 5)) { // Limit to 5 per call
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        const data = await response.json();
        
        if (data['Note']) {
          console.log('Rate limit hit:', data['Note']);
          rateLimitHit = true;
          break;
        }

        const quote = data['Global Quote'];
        if (!quote || !quote['05. price']) {
          console.log(`No data for ${symbol}`);
          continue;
        }

        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

        // Upsert into market_data_cache
        await supabaseClient
          .from('market_data_cache')
          .upsert({
            symbol,
            current_price: price,
            change_amount: change,
            change_percent: changePercent,
            volume: parseInt(quote['06. volume'] || '0'),
            last_updated: new Date().toISOString(),
          }, {
            onConflict: 'symbol'
          });

        updatedCount++;
        console.log(`Updated ${symbol}: $${price} (${changePercent}%)`);

      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        symbols_processed: updatedCount,
        total_symbols: uniqueSymbols.length,
        rate_limit_hit: rateLimitHit,
        message: rateLimitHit 
          ? 'Partial update due to rate limit'
          : 'Market data updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch Market Data Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
