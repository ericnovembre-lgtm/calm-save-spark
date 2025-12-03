import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedLifeEvent {
  event_type: string;
  label: string;
  icon: string;
  year: number;
  financial_impact: number;
  ongoing_impact: number;
  description: string;
  confidence: number;
}

const EVENT_TEMPLATES: Record<string, { icon: string; category: string }> = {
  home_purchase: { icon: '🏠', category: 'major_purchase' },
  marriage: { icon: '💒', category: 'life_event' },
  child: { icon: '👶', category: 'life_event' },
  job_loss: { icon: '📉', category: 'income_change' },
  job_change: { icon: '💼', category: 'income_change' },
  promotion: { icon: '🚀', category: 'income_change' },
  car_purchase: { icon: '🚗', category: 'major_purchase' },
  education: { icon: '🎓', category: 'investment' },
  medical_expense: { icon: '🏥', category: 'expense' },
  inheritance: { icon: '💰', category: 'windfall' },
  business_start: { icon: '🏢', category: 'income_change' },
  retirement_early: { icon: '🏖️', category: 'life_event' },
  relocation: { icon: '✈️', category: 'life_event' },
  divorce: { icon: '💔', category: 'life_event' },
  vacation: { icon: '🌴', category: 'expense' },
  renovation: { icon: '🔨', category: 'major_purchase' },
  investment: { icon: '📈', category: 'investment' },
  debt_payoff: { icon: '✅', category: 'financial' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { description, currentAge } = await req.json();
    
    if (!description) {
      throw new Error('Description is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are a financial life event parser. Extract structured information from natural language descriptions of life events.

Current user age: ${currentAge || 30}

Available event types: ${Object.keys(EVENT_TEMPLATES).join(', ')}

Return a JSON object with these fields:
- event_type: One of the available types
- label: Short human-readable label (e.g., "Buy $400k House")
- year: The age when this event occurs (number)
- financial_impact: One-time financial impact in dollars (negative for expenses, positive for income)
- ongoing_impact: Monthly ongoing impact in dollars (e.g., mortgage payment, salary change)
- description: Brief description of the financial reasoning
- confidence: How confident you are in this parsing (0-1)

Examples:
- "Buy a $500k house in 3 years" → {"event_type": "home_purchase", "label": "Buy $500k House", "year": ${(currentAge || 30) + 3}, "financial_impact": -100000, "ongoing_impact": -2500, "description": "Down payment of ~20% with monthly mortgage ~$2500", "confidence": 0.9}
- "Get a $20k raise next year" → {"event_type": "promotion", "label": "$20k Raise", "year": ${(currentAge || 30) + 1}, "financial_impact": 0, "ongoing_impact": 1667, "description": "Annual salary increase of $20k equals ~$1667/month pre-tax", "confidence": 0.95}

ONLY return the JSON object, no other text.`;

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
          { role: 'user', content: description },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI parsing error:', errorText);
      throw new Error('Failed to parse life event');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    let parsed: ParsedLifeEvent;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response');
    }

    // Enrich with icon from templates
    const template = EVENT_TEMPLATES[parsed.event_type];
    if (template) {
      parsed.icon = template.icon;
    } else {
      parsed.icon = '📌';
    }

    // Validate and sanitize
    parsed.year = Math.max(currentAge || 30, Math.min(100, parsed.year || (currentAge || 30) + 1));
    parsed.financial_impact = parsed.financial_impact || 0;
    parsed.ongoing_impact = parsed.ongoing_impact || 0;
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

    console.log(`Parsed life event: ${parsed.label} at age ${parsed.year}`);

    // Log analytics
    await supabase.from('digital_twin_analytics').insert({
      user_id: user.id,
      event_type: 'scenario_created_nl',
      model_used: 'google/gemini-2.5-flash',
      query_text: description,
      scenario_parameters: parsed,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      event: parsed,
      originalDescription: description,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Parse Life Event NL error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
