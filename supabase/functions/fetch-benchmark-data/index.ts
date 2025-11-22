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

    const body = await req.json().catch(() => ({}));
    const isInitialLoad = body.initial === true;

    if (isInitialLoad) {
      // Fetch 30 days of historical data
      console.log('Fetching 30 days of S&P 500 historical data');
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`
      );

      const data = await response.json();
      
      if (data['Note']) {
        throw new Error('Rate limit hit: ' + data['Note']);
      }

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No time series data available');
      }

      const entries = Object.entries(timeSeries).slice(0, 30);
      let inserted = 0;

      for (const [date, values] of entries) {
        const closePrice = parseFloat((values as any)['4. close']);
        const prevEntry = entries[entries.indexOf([date, values]) + 1];
        const prevClose = prevEntry ? parseFloat((prevEntry[1] as any)['4. close']) : closePrice;
        const changePercent = ((closePrice - prevClose) / prevClose) * 100;

        await supabaseClient
          .from('benchmark_data')
          .upsert({
            benchmark_name: 'S&P 500',
            date,
            value: closePrice,
            change_percent: changePercent,
          }, {
            onConflict: 'benchmark_name,date'
          });

        inserted++;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          days_loaded: inserted,
          message: 'S&P 500 historical data loaded successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Daily update - fetch just today's value
      console.log('Fetching today\'s S&P 500 data');
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      const data = await response.json();
      
      if (data['Note']) {
        throw new Error('Rate limit hit: ' + data['Note']);
      }

      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error('No quote data available');
      }

      const price = parseFloat(quote['05. price']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
      const today = new Date().toISOString().split('T')[0];

      await supabaseClient
        .from('benchmark_data')
        .upsert({
          benchmark_name: 'S&P 500',
          date: today,
          value: price,
          change_percent: changePercent,
        }, {
          onConflict: 'benchmark_name,date'
        });

      return new Response(
        JSON.stringify({ 
          success: true,
          date: today,
          value: price,
          change_percent: changePercent,
          message: 'S&P 500 data updated successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Fetch Benchmark Data Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
