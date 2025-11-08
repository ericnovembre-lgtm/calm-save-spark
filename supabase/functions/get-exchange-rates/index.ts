import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { base = 'USD', target } = await req.json();
    
    if (!target) {
      throw new Error('target currency is required');
    }

    // Check cache first (rates valid for 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: cachedRate } = await supabaseClient
      .from('exchange_rates')
      .select('*')
      .eq('base_currency', base)
      .eq('target_currency', target)
      .gte('fetched_at', oneHourAgo)
      .single();

    if (cachedRate) {
      console.log('Using cached exchange rate');
      return new Response(
        JSON.stringify({ 
          rate: cachedRate.rate,
          base_currency: base,
          target_currency: target,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch fresh rate from API
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
    if (!apiKey) {
      throw new Error('Exchange rate API key not configured');
    }

    console.log(`Fetching fresh exchange rate: ${base} -> ${target}`);

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${target}`
    );

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'Failed to fetch exchange rate');
    }

    const rate = data.conversion_rate;

    // Update cache
    await supabaseClient
      .from('exchange_rates')
      .upsert({
        base_currency: base,
        target_currency: target,
        rate,
        fetched_at: new Date().toISOString(),
      }, {
        onConflict: 'base_currency,target_currency'
      });

    return new Response(
      JSON.stringify({ 
        rate,
        base_currency: base,
        target_currency: target,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});