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
    const { base, target } = await req.json();
    
    console.log(`Fetching exchange rate: ${base} -> ${target}`);

    // Use ExchangeRate-API (they have a free tier)
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
    
    if (!apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY not configured');
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${target}`
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`Exchange rate API returned error: ${data['error-type']}`);
    }

    const rate = data.conversion_rate;

    // Store in database for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('exchange_rates')
      .upsert({
        base_currency: base,
        target_currency: target,
        rate: rate,
        fetched_at: new Date().toISOString(),
      }, {
        onConflict: 'base_currency,target_currency'
      });

    console.log(`Exchange rate stored: ${base}/${target} = ${rate}`);

    return new Response(
      JSON.stringify({ rate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, rate: 1 }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
