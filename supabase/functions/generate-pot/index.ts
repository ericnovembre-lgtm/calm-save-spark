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
    const { dreamText } = await req.json();
    
    if (!dreamText || typeof dreamText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Dream text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for structured extraction
    const systemPrompt = `You are a financial assistant that helps users create savings goals. Extract structured data from natural language dreams.

Given user input, return JSON with:
- item_name: The specific thing they want (string)
- category: One of [vacation, vehicle, electronics, home, education, emergency, other] (string)
- suggested_amount: Realistic cost in USD based on typical market prices (number)
- icon: lucide-react icon name matching category (string)
- image_query: Short search query for finding relevant images (string)

Examples:
Input: "A vintage Vespa"
Output: {"item_name":"Vintage Vespa","category":"vehicle","suggested_amount":3000,"icon":"Bike","image_query":"vintage vespa scooter"}

Input: "Trip to Japan"
Output: {"item_name":"Trip to Japan","category":"vacation","suggested_amount":5000,"icon":"Plane","image_query":"japan travel tokyo"}

Input: "Emergency fund"
Output: {"item_name":"Emergency Fund","category":"emergency","suggested_amount":5000,"icon":"Shield","image_query":"financial safety emergency"}`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dreamText }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const generatedPot = JSON.parse(content);
    
    // Validate required fields
    if (!generatedPot.item_name || !generatedPot.category || !generatedPot.suggested_amount) {
      throw new Error('Invalid AI response format');
    }

    // Icon mapping for categories
    const iconMap: Record<string, string> = {
      vacation: 'Palmtree',
      vehicle: 'Car',
      electronics: 'Laptop',
      home: 'Home',
      education: 'GraduationCap',
      emergency: 'Shield',
      other: 'Target'
    };

    // Use mapped icon or default
    generatedPot.icon = iconMap[generatedPot.category] || 'Target';

    return new Response(
      JSON.stringify(generatedPot),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error generating pot:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
