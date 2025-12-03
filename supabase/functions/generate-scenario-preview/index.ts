import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenarioName, finalNetWorth, events, successProbability } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Generate preview image using Lovable AI
    const prompt = `Create a futuristic financial scenario preview card with a dark background (#050505) and cyan accent colors (#00FFFF). 
    
    Show:
    - Title: "${scenarioName}" in large futuristic font at top
    - A smooth upward curving line graph representing net worth growth over time
    - Final net worth of $${finalNetWorth.toLocaleString()} prominently displayed
    - ${events.length} life events as glowing markers on the timeline
    - Success probability badge: ${successProbability}% in top right corner
    - $ave+ logo in bottom left
    - Subtle grid pattern background
    - Holographic/glowing effect on key elements
    
    Style: Data futurism, Minority Report UI, sleek, professional, high-tech. 
    Aspect ratio: 16:9 landscape for social media sharing.`;

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
        model: 'google/gemini-2.5-flash-image',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to generate preview image');
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Extract base64 from data URL if present
    const base64Data = imageUrl.includes('base64,') 
      ? imageUrl.split('base64,')[1] 
      : imageUrl;

    // Convert base64 to blob
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to storage
    const fileName = `${user.id}/${Date.now()}-${scenarioName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scenario-previews')
      .upload(fileName, bytes, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload preview image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scenario-previews')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        fileName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});