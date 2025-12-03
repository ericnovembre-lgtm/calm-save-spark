import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pageRoute, pageTitle, pageData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate contextual conversation starters
    const systemPrompt = `You are an AI that generates helpful, contextual conversation starters for a financial app.
Generate 3-5 short, natural conversation starters based on the user's current context.
Each starter should be a complete question or suggestion that feels natural to start a conversation.
Return only a JSON array of objects with "text" and "category" fields.
Categories: "time", "page", "pattern", "alert"`;

    const userPrompt = `Generate conversation starters for:
Page: ${pageTitle} (${pageRoute})
Context: ${JSON.stringify(pageData || {})}
Current time: ${new Date().toLocaleString()}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    // Parse the JSON response
    let starters;
    try {
      starters = JSON.parse(content);
    } catch {
      // If parsing fails, use default starters
      starters = [
        { text: "How can I help you today?", category: "time" },
        { text: "What would you like to know?", category: "page" }
      ];
    }

    return new Response(
      JSON.stringify({ starters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating starters:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        starters: [
          { text: "How can I help you today?", category: "time" },
          { text: "What would you like to know?", category: "page" }
        ]
      }),
      { 
        status: 200, // Return 200 with fallback starters
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
