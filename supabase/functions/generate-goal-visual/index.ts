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
    const { goalName } = await req.json();
    
    if (!goalName) {
      return new Response(
        JSON.stringify({ error: 'Goal name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache first
    const { data: cached } = await supabaseClient
      .from('goal_visuals')
      .select('image_url, prompt_used')
      .eq('goal_name', goalName)
      .single();

    if (cached) {
      console.log('Returning cached visual for:', goalName);
      return new Response(
        JSON.stringify({ 
          imageUrl: cached.image_url,
          prompt: cached.prompt_used,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate smart prompt from goal name
    const prompt = generateSmartPrompt(goalName);
    console.log('Generated prompt:', prompt);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate image using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{
          role: 'user',
          content: prompt
        }],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status, await aiResponse.text());
      throw new Error('Failed to generate image');
    }

    const aiData = await aiResponse.json();
    const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      throw new Error('No image generated');
    }

    // Upload to Supabase Storage
    const fileName = `goal-${Date.now()}-${goalName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('avatars') // Using existing public bucket
      .upload(`goal-visuals/${fileName}`, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(`goal-visuals/${fileName}`);

    // Cache the result
    await supabaseClient
      .from('goal_visuals')
      .insert({
        goal_name: goalName,
        prompt_used: prompt,
        image_url: publicUrl
      });

    console.log('Successfully generated visual for:', goalName);
    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        prompt,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating goal visual:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSmartPrompt(goalName: string): string {
  const name = goalName.toLowerCase();
  
  // Travel/vacation goals
  if (name.includes('trip') || name.includes('vacation') || name.includes('travel')) {
    if (name.includes('japan') || name.includes('tokyo') || name.includes('kyoto')) {
      return 'Serene Kyoto temple at golden hour, peaceful zen garden, cherry blossoms, minimalist composition, soft lighting, ultra high resolution';
    }
    if (name.includes('paris') || name.includes('france')) {
      return 'Eiffel Tower at sunset, romantic Parisian atmosphere, warm golden tones, elegant composition, ultra high resolution';
    }
    if (name.includes('beach') || name.includes('tropical')) {
      return 'Pristine tropical beach, turquoise water, white sand, palm trees, peaceful atmosphere, ultra high resolution';
    }
    return 'Beautiful travel destination, inspiring wanderlust, vibrant colors, scenic view, ultra high resolution';
  }
  
  // House/property goals
  if (name.includes('house') || name.includes('home') || name.includes('property')) {
    return 'Modern dream home exterior, beautiful architecture, warm inviting atmosphere, lush landscaping, ultra high resolution';
  }
  
  // Car/vehicle goals
  if (name.includes('car') || name.includes('vehicle') || name.includes('tesla')) {
    return 'Sleek modern vehicle, elegant design, premium automotive photography, dramatic lighting, ultra high resolution';
  }
  
  // Education goals
  if (name.includes('education') || name.includes('college') || name.includes('university')) {
    return 'Beautiful university campus, inspiring academic atmosphere, autumn colors, architectural excellence, ultra high resolution';
  }
  
  // Emergency/savings goals
  if (name.includes('emergency') || name.includes('fund') || name.includes('savings')) {
    return 'Peaceful financial security concept, safe and stable, calm colors, minimalist design, ultra high resolution';
  }
  
  // Wedding goals
  if (name.includes('wedding') || name.includes('marriage')) {
    return 'Elegant wedding scene, romantic atmosphere, beautiful florals, warm lighting, dreamy composition, ultra high resolution';
  }
  
  // Default: financial growth theme
  return 'Financial growth and prosperity, upward movement, optimistic colors, modern design, ultra high resolution';
}
