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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { context, transactionData } = await req.json();

    // Analyze recent trading patterns
    const emotionIndicators = {
      fomo: 0,
      fud: 0,
      greed: 0,
      fear: 0,
      panic: 0,
    };

    // Check for FOMO indicators
    if (transactionData?.recentTransactions) {
      const recentCount = transactionData.recentTransactions.length;
      const rapidTrading = recentCount > 5 && transactionData.timeWindow === '24h';
      if (rapidTrading) emotionIndicators.fomo += 0.3;
    }

    // Check for FUD indicators
    if (context?.marketVolatility === 'high') {
      emotionIndicators.fud += 0.2;
    }

    // Check transaction size relative to portfolio
    if (transactionData?.proposedAmount > transactionData?.portfolioValue * 0.2) {
      emotionIndicators.greed += 0.4;
    }

    // Use AI for sentiment analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a behavioral finance expert analyzing trading behavior.
    Detect emotional decision-making patterns like FOMO, FUD, greed, fear, or panic.
    Return a JSON object with: {"emotion": "fomo|fud|greed|fear|panic|neutral", "confidence": 0-1, "triggers": ["trigger1", "trigger2"], "reasoning": "brief explanation"}`;

    const userMessage = `Analyze this trading context:
    - Proposed Amount: $${transactionData?.proposedAmount || 0}
    - Portfolio Value: $${transactionData?.portfolioValue || 0}
    - Recent Transactions (24h): ${transactionData?.recentTransactions?.length || 0}
    - Market Condition: ${context?.marketVolatility || 'normal'}
    - User Notes: ${context?.userNotes || 'none'}
    - Time of Day: ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
    
    Detect emotional trading signals.`;

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
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0]?.message?.content || '{}');

    // Save emotion detection
    const { data: emotion } = await supabaseClient
      .from('trading_emotions')
      .insert({
        user_id: user.id,
        detected_emotion: analysis.emotion || 'neutral',
        confidence_score: analysis.confidence || 0,
        triggers: { triggers: analysis.triggers || [], reasoning: analysis.reasoning },
        detected_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Check if intervention is needed
    const shouldIntervene = analysis.confidence > 0.6 && ['fomo', 'fud', 'panic', 'greed'].includes(analysis.emotion);

    return new Response(
      JSON.stringify({
        emotion: analysis.emotion,
        confidence: analysis.confidence,
        triggers: analysis.triggers,
        reasoning: analysis.reasoning,
        shouldIntervene,
        emotionId: emotion?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sentiment-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
