import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts } = await req.json();
    const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');

    if (!COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY not configured');
    }

    if (!texts || !Array.isArray(texts)) {
      throw new Error('texts array is required');
    }

    console.log(`Generating embeddings for ${texts.length} texts`);

    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cohere API error:', response.status, errorText);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ embeddings: data.embeddings }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
