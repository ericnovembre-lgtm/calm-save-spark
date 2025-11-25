import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionId, merchantName } = await req.json();

    if (!transactionId || !merchantName) {
      return new Response(JSON.stringify({ error: 'Missing transactionId or merchantName' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache in merchant_locations table
    const { data: cachedLocation, error: cacheError } = await supabaseClient
      .from('merchant_locations')
      .select('*')
      .eq('merchant_name', merchantName)
      .maybeSingle();

    if (cacheError) {
      console.error('Cache lookup error:', cacheError);
    }

    let locationData = cachedLocation;

    // If not in cache, call Mapbox Geocoding API
    if (!cachedLocation) {
      console.log(`Geocoding merchant: ${merchantName}`);
      
      const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
      if (!mapboxToken) {
        console.error('MAPBOX_PUBLIC_TOKEN not configured');
        return new Response(JSON.stringify({ error: 'Mapbox token not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Clean merchant name for better geocoding
      const cleanedName = merchantName
        .replace(/\b(ACH|DEBIT|CREDIT|WID|PYMT|TRNSFR|XFER|\d{4,})\b/gi, '')
        .trim();

      // Call Mapbox Geocoding API
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanedName)}.json?access_token=${mapboxToken}&types=poi,address&limit=1`;
      
      const geocodeResponse = await fetch(geocodeUrl);
      
      if (!geocodeResponse.ok) {
        console.error('Mapbox API error:', await geocodeResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to geocode merchant' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        console.log(`No geocoding results for: ${merchantName}`);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Location not found',
          merchantName 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const feature = geocodeData.features[0];
      const [lon, lat] = feature.geometry.coordinates;
      
      // Extract city and state from context
      let city = null;
      let state = null;
      if (feature.context) {
        const placeContext = feature.context.find((c: any) => c.id.startsWith('place'));
        const regionContext = feature.context.find((c: any) => c.id.startsWith('region'));
        city = placeContext?.text || null;
        state = regionContext?.short_code?.replace('US-', '') || null;
      }

      const confidence = feature.relevance || 0.5;

      // Cache the result
      const { data: insertedLocation, error: insertError } = await supabaseClient
        .from('merchant_locations')
        .insert({
          merchant_name: merchantName,
          lat,
          lon,
          city,
          state,
          confidence,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error caching location:', insertError);
      } else {
        locationData = insertedLocation;
      }
    }

    // Update transaction with geocoded location
    if (locationData) {
      const { error: updateError } = await supabaseClient
        .from('card_transactions')
        .update({
          merchant_lat: locationData.lat,
          merchant_lon: locationData.lon,
          merchant_city: locationData.city,
          merchant_state: locationData.state,
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update transaction' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      location: locationData,
      cached: !!cachedLocation,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in geocode-merchant-mapbox:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
