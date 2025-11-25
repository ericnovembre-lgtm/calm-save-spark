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
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache first
    const { data: cached } = await supabaseClient
      .from('merchant_locations')
      .select('*')
      .eq('merchant_name', merchantName)
      .single();

    let locationData = cached;

    if (!cached) {
      // Use Lovable AI to infer location from merchant name
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: `You are a geocoding assistant. Given a merchant name, infer the most likely city and state in the US. 
Return ONLY a JSON object with this exact structure:
{
  "city": "City Name",
  "state": "ST",
  "lat": 40.7128,
  "lon": -74.0060,
  "confidence": 0.85
}

Common patterns:
- "STARBUCKS #12345 NEW YORK NY" -> New York, NY
- "TARGET T-0234 LOS ANGELES" -> Los Angeles, CA
- "WHOLE FOODS MKT #10155" -> Use corporate HQ (Austin, TX)
- "UBER TRIP" -> User's likely location (default to NYC)

If uncertain, use major US city coordinates and set confidence < 0.7`
          }, {
            role: 'user',
            content: `Merchant: ${merchantName}`
          }],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Lovable AI error:', aiResponse.status, errorText);
        throw new Error('AI geocoding failed');
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No AI response content');
      }

      // Parse AI response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const geoData = JSON.parse(jsonMatch[0]);

      // Insert into cache
      const { data: inserted } = await supabaseClient
        .from('merchant_locations')
        .insert({
          merchant_name: merchantName,
          lat: geoData.lat,
          lon: geoData.lon,
          city: geoData.city,
          state: geoData.state,
          country: 'US',
          confidence: geoData.confidence,
          source: 'ai',
        })
        .select()
        .single();

      locationData = inserted;
    }

    // Update transaction with location data
    if (locationData) {
      await supabaseClient
        .from('card_transactions')
        .update({
          merchant_lat: locationData.lat,
          merchant_lon: locationData.lon,
          merchant_city: locationData.city,
          merchant_state: locationData.state,
          merchant_country: locationData.country,
          geo_confidence: locationData.confidence,
        })
        .eq('id', transactionId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      location: locationData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in geocode-merchant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
