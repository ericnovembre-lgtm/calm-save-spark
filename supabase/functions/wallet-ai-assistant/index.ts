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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, input, address, contacts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Action 1: Parse Natural Language Send Command
    if (action === 'parse_send') {
      const systemPrompt = `You are a crypto wallet assistant. Parse natural language send commands into structured data.
Extract: amount, token (default ETH), recipient name or address.
If recipient is a name, check the contacts list to resolve it to an address.
Return JSON: { "action": "send", "amount": number, "token": string, "recipient": { "name"?: string, "address": string } }`;

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
            { role: 'user', content: `Input: "${input}"\nContacts: ${JSON.stringify(contacts)}` }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'parse_transaction',
              description: 'Parse transaction intent',
              parameters: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  amount: { type: 'number' },
                  token: { type: 'string' },
                  recipient: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      address: { type: 'string' }
                    },
                    required: ['address']
                  }
                },
                required: ['action', 'amount', 'recipient']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'parse_transaction' } }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Error:', errorText);
        throw new Error('Failed to parse input');
      }

      const aiResponse = await response.json();
      const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ parsed }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Action 2: Address Detective
    if (action === 'detect_address') {
      const systemPrompt = `You are an Ethereum address analyzer. Analyze addresses for:
1. Valid format (0x + 40 hex chars)
2. Known labels (Uniswap, popular contracts)
3. Warnings (flagged for phishing, suspicious)
Return JSON: { "isValid": bool, "type": string, "label": string, "warning": string, "info": string }`;

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
            { role: 'user', content: `Analyze address: ${address}` }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'analyze_address',
              description: 'Analyze Ethereum address',
              parameters: {
                type: 'object',
                properties: {
                  isValid: { type: 'boolean' },
                  type: { type: 'string' },
                  label: { type: 'string' },
                  warning: { type: 'string' },
                  info: { type: 'string' }
                },
                required: ['isValid']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'analyze_address' } }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze address');
      }

      const aiResponse = await response.json();
      const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Action 3: Gas Guru Advice
    if (action === 'gas_advice') {
      const systemPrompt = `You are a gas fee advisor. Analyze current network conditions and provide timing advice for optimal gas fees.
Return JSON: { "currentLevel": string, "advice": string, "bestTime": string, "predictedSavings": number }`;

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
            { role: 'user', content: 'Provide gas fee timing advice for Ethereum mainnet' }
          ],
        })
      });

      const aiResponse = await response.json();
      const advice = aiResponse.choices?.[0]?.message?.content;
      
      return new Response(
        JSON.stringify({ advice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});