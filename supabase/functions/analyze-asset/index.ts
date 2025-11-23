import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { symbol, name, currentValue } = await req.json();

    console.log(`Analyzing asset: ${symbol} (${name})`);

    // Fetch real-time market data from Perplexity
    let marketData = '';
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (PERPLEXITY_API_KEY) {
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: 'Provide current market data and recent news for the requested asset. Be factual and concise.'
              },
              {
                role: 'user',
                content: `Get current market data for ${symbol}: current price, 24h change, market cap, and any major news from the last 48 hours.`
              }
            ],
            temperature: 0.2,
            max_tokens: 500,
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          marketData = perplexityData.choices?.[0]?.message?.content || '';
          console.log('Fetched market data from Perplexity');
        }
      } catch (error) {
        console.error('Perplexity API error:', error);
      }
    }

    // Generate AI analysis using Gemini
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a senior hedge fund analyst with 15 years of experience in equity research. Analyze assets with these principles:

BULL CASE: Focus on catalysts, competitive advantages, market trends, technical momentum. Be specific with numbers and timelines.

BEAR CASE: Highlight risks, overvaluation signals, regulatory concerns, competitive threats. Be realistic, not overly pessimistic.

RISK RATING: Consider volatility, concentration risk, macro factors, liquidity.
- Low: Blue-chip with <15% annual volatility
- Medium: Established companies with 15-30% volatility
- High: Growth stocks/ETFs with 30-50% volatility
- Very High: Speculative assets (crypto, small caps) >50% volatility

Always cite specific numbers from the provided market data.`;

    const userPrompt = `Analyze ${symbol} (${name})

**Real-Time Market Data:**
${marketData || 'No real-time data available - use general knowledge'}

**User Context:**
- Current Holding Value: $${currentValue.toLocaleString()}

Generate a comprehensive analysis with bull case, bear case, and risk assessment.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "provide_asset_analysis",
          description: "Provide structured analysis of an investment asset",
          parameters: {
            type: "object",
            properties: {
              bullCase: {
                type: "string",
                description: "2-3 sentence bull case with specific catalysts and numbers"
              },
              bearCase: {
                type: "string",
                description: "2-3 sentence bear case with specific risks"
              },
              riskRating: {
                type: "string",
                enum: ["Low", "Medium", "High", "Very High"],
                description: "Risk rating based on volatility and fundamentals"
              },
              riskExplanation: {
                type: "string",
                description: "1-2 sentence explanation of risk rating"
              }
            },
            required: ["bullCase", "bearCase", "riskRating", "riskExplanation"]
          }
        }
      }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "provide_asset_analysis" } },
        max_completion_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate analysis');
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    const response = {
      bullCase: analysis.bullCase,
      bearCase: analysis.bearCase,
      riskRating: analysis.riskRating,
      riskExplanation: analysis.riskExplanation,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-asset:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
