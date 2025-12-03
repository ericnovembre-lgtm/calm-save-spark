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

    // Enhanced system prompt for intelligent pot creation
    const systemPrompt = `You are an expert financial assistant specializing in goal-based savings. Analyze user dreams to create realistic, motivating savings goals.

Given user input, return JSON with:
- item_name: The specific thing they want (string)
- category: One of [vacation, vehicle, electronics, home, education, emergency, other] (string)
- suggested_amount: Realistic cost in USD based on market research, context, and quality tier (number)
- icon: lucide-react icon name matching category (string)
- image_query: Short search query for finding relevant images (string)
- color_theme: Choose ONE from [cyber-grape, neon-sunset, ocean-depth, emerald-dream, fire-opal] (string)
- reasoning: Brief 1-sentence explanation of amount/theme choice (string)

Color theme guidelines:
- cyber-grape: Tech, vehicles, gadgets, futuristic goals
- neon-sunset: Warm experiences, tropical vacations, celebrations
- ocean-depth: International travel, education, peaceful goals
- emerald-dream: Nature, health, home, sustainable living
- fire-opal: Bold ambitions, emergency funds, career goals

Examples:
Input: "2 week trip to Kyoto in spring"
Output: {"item_name":"2-Week Kyoto Spring Adventure","category":"vacation","suggested_amount":5500,"icon":"Plane","image_query":"kyoto cherry blossoms temple","color_theme":"neon-sunset","reasoning":"Spring cherry blossom season with mid-range hotels, flights from US, daily activities and dining"}

Input: "Used Tesla Model 3"
Output: {"item_name":"Tesla Model 3","category":"vehicle","suggested_amount":35000,"icon":"Car","image_query":"tesla model 3 electric car","color_theme":"cyber-grape","reasoning":"Average market price for 2-3 year old Model 3 with 30k miles in good condition"}

Input: "Emergency fund for 6 months"
Output: {"item_name":"6-Month Emergency Fund","category":"emergency","suggested_amount":15000,"icon":"Shield","image_query":"financial security safety net","color_theme":"fire-opal","reasoning":"Based on $2,500/month essential expenses for housing, utilities, food, and healthcare"}

Input: "Gaming laptop"
Output: {"item_name":"High-Performance Gaming Laptop","category":"electronics","suggested_amount":1800,"icon":"Laptop","image_query":"gaming laptop rgb","color_theme":"cyber-grape","reasoning":"Mid-to-high tier gaming laptop with RTX 4060, 16GB RAM, suitable for AAA games"}

Be context-aware: Consider duration, quality tier (budget/mid/luxury), seasonality, location, and current market trends.`;

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
    if (!generatedPot.item_name || !generatedPot.category || !generatedPot.suggested_amount || !generatedPot.color_theme || !generatedPot.reasoning) {
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
