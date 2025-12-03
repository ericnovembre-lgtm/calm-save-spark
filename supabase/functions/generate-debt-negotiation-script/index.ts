// Edge function to generate AI-powered debt negotiation scripts
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
    const { debt_name, creditor, balance, interest_rate, debt_type } = await req.json();

    if (!debt_name || !creditor || !balance || !interest_rate) {
      return new Response(
        JSON.stringify({ error: 'Missing required debt information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a professional debt negotiation advisor helping users negotiate lower APR rates with their creditors.

Generate a conversational, professional negotiation script that sounds natural and empathetic. The script should:
- Address the creditor by name
- Reference the specific balance and current APR
- Cite loyalty and payment history (assume good standing)
- Request a significant APR reduction (aim for 50% reduction or target below 15%)
- Include backup strategies if the initial request is declined
- Maintain a respectful but firm tone

Return a structured negotiation script with clear sections.`;

    const userPrompt = `Create a negotiation script for the following debt:

Debt Details:
- Name: ${debt_name}
- Creditor: ${creditor}
- Type: ${debt_type}
- Current Balance: $${balance}
- Current APR: ${interest_rate}%

Generate a script that will help the user negotiate a lower APR. Make it conversational and professional.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_negotiation_script",
            description: "Generate a personalized debt negotiation script",
            parameters: {
              type: "object",
              properties: {
                opening: { 
                  type: "string", 
                  description: "Opening statement to start the call professionally" 
                },
                talking_points: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "3-5 key points to mention during negotiation"
                },
                apr_request: { 
                  type: "string", 
                  description: "Specific APR reduction request with target rate" 
                },
                fallback_strategies: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-3 alternative negotiation angles if declined"
                },
                closing: { 
                  type: "string", 
                  description: "Professional closing statement" 
                }
              },
              required: ["opening", "talking_points", "apr_request", "closing"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_negotiation_script" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please upgrade or try later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('AI error:', aiResponse.status, await aiResponse.text());
      throw new Error('Failed to generate negotiation script');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const script = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        script,
        success_rate: 68 // Estimated success rate for user motivation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-debt-negotiation-script:', error);
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
