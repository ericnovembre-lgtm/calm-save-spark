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

    const { emotionId, transactionData } = await req.json();

    // Get user's guardrails
    const { data: guardrails } = await supabaseClient
      .from('behavioral_guardrails')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Check if cooling off period needed
    const coolingOffRule = guardrails?.find(g => g.rule_type === 'cooling_off');
    let coolingOffRequired = false;
    let coolingOffMinutes = 0;

    if (coolingOffRule) {
      coolingOffMinutes = coolingOffRule.parameters?.duration_minutes || 15;
      coolingOffRequired = true;
    }

    // Generate counter-arguments using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a rational financial advisor intervening in an emotional trading decision.
    Provide 3 data-driven counter-arguments to help the user pause and think rationally.
    Be empathetic but firm. Use specific numbers and statistics.
    Format as JSON: {"arguments": [{"title": "string", "content": "string", "data": "statistic"}]}`;

    const userMessage = `The user is about to make this trade:
    - Amount: $${transactionData?.proposedAmount || 0}
    - Asset: ${transactionData?.asset || 'unknown'}
    - Detected Emotion: ${transactionData?.emotion || 'unknown'}
    - Recent Losses: $${transactionData?.recentLosses || 0}
    
    Provide rational counter-arguments to this emotional decision.`;

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
    const intervention = JSON.parse(aiData.choices[0]?.message?.content || '{"arguments": []}');

    // Create cooling off session if required
    let coolingOffSession = null;
    if (coolingOffRequired) {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + coolingOffMinutes);

      const { data } = await supabaseClient
        .from('cooling_off_sessions')
        .insert({
          user_id: user.id,
          triggered_by: transactionData?.emotion || 'emotional_trading',
          end_time: endTime.toISOString(),
        })
        .select()
        .single();

      coolingOffSession = data;
    }

    // Update emotion record
    await supabaseClient
      .from('trading_emotions')
      .update({ intervention_shown: true })
      .eq('id', emotionId);

    return new Response(
      JSON.stringify({
        intervention: {
          type: coolingOffRequired ? 'cooling_off' : 'warning',
          arguments: intervention.arguments || [],
          coolingOffMinutes,
          coolingOffSession,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in guardian-intervene:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
