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

    const { action, input, address, contacts, current_gas_gwei } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Action 1: Parse Natural Language Send/Swap Command
    if (action === 'parse_send') {
      const systemPrompt = `You are a crypto wallet assistant. Parse natural language transaction commands.
Detect if it's a SEND or SWAP:
- SEND: "Send X ETH to Mike" → { type: "SEND", amount, token, recipient }
- SWAP: "Swap 100 USDC for SOL" → { type: "SWAP", amount, fromToken, toToken }

For SEND: Extract amount, token (default ETH), recipient name or address.
For SWAP: Extract amount, fromToken, toToken.`;

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
            { role: 'user', content: `Input: "${input}"\nContacts: ${JSON.stringify(contacts || [])}` }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'parse_transaction',
              description: 'Parse transaction intent',
              parameters: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['SEND', 'SWAP'] },
                  action: { type: 'string' },
                  amount: { type: 'number' },
                  token: { type: 'string' },
                  fromToken: { type: 'string' },
                  toToken: { type: 'string' },
                  recipient: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      address: { type: 'string' }
                    }
                  }
                },
                required: ['type', 'amount']
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

    // Action 3: Gas Guru Witty Traffic Report
    if (action === 'gas_advice') {
      const gasGwei = current_gas_gwei || 25;
      const systemPrompt = `You are a witty Ethereum gas analyst. Current gas: ${gasGwei} gwei.
Generate a SHORT (max 15 words), witty "traffic report" style tip about whether to transact now or wait.
Examples: "Highway's clear! Great time to cruise." or "Rush hour chaos, grab coffee and wait."
Return format: { "fee": "~$X.XX", "tip": "your witty message" }`;

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
            { role: 'user', content: `Generate witty gas advice for ${gasGwei} gwei` }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'generate_gas_tip',
              description: 'Generate gas fee tip',
              parameters: {
                type: 'object',
                properties: {
                  fee: { type: 'string', description: 'Estimated fee like ~$4.20' },
                  tip: { type: 'string', description: 'Short witty traffic report style message' }
                },
                required: ['fee', 'tip']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'generate_gas_tip' } }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate gas advice');
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