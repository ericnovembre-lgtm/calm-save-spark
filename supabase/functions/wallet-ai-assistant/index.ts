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

    const { action, input, address, contacts, current_gas_gwei, tokens, nft } = await req.json();
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
          model: 'google/gemini-3-pro',
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
          model: 'google/gemini-3-pro',
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
          model: 'google/gemini-3-pro',
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

    // Action 4: Portfolio Risk Analyst
    if (action === 'analyze_portfolio') {
      const totalValue = tokens.reduce((sum: number, t: any) => sum + t.usdValue, 0);
      const volatileValue = tokens
        .filter((t: any) => !t.isStablecoin)
        .reduce((sum: number, t: any) => sum + t.usdValue, 0);
      const stableValue = tokens
        .filter((t: any) => t.isStablecoin)
        .reduce((sum: number, t: any) => sum + t.usdValue, 0);
      
      const volatilePercent = Math.round((volatileValue / totalValue) * 100);
      const stablePercent = Math.round((stableValue / totalValue) * 100);

      // Find concentration (largest holding)
      const sortedTokens = [...tokens].sort((a: any, b: any) => b.usdValue - a.usdValue);
      const largestHolding = sortedTokens[0];
      const concentrationPercent = Math.round((largestHolding.usdValue / totalValue) * 100);

      const systemPrompt = `You are a portfolio risk analyst. Analyze this portfolio:
Total Value: $${totalValue.toFixed(2)}
Volatile Assets: ${volatilePercent}% ($${volatileValue.toFixed(2)})
Stable Assets: ${stablePercent}% ($${stableValue.toFixed(2)})
Largest Holding: ${largestHolding.symbol} (${concentrationPercent}%)

Provide:
1. Risk level (low if <60% volatile, medium if 60-80%, high if >80%)
2. A 2-3 sentence assessment explaining the risk
3. A practical diversification tip (max 25 words)
4. A concentration warning if any single asset is >70%`;

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
            { role: 'user', content: 'Analyze this portfolio' }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'analyze_portfolio_risk',
              description: 'Analyze portfolio risk',
              parameters: {
                type: 'object',
                properties: {
                  riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
                  assessment: { type: 'string', description: '2-3 sentence risk assessment' },
                  tip: { type: 'string', description: 'Diversification tip (max 25 words)' },
                  concentrationWarning: { type: 'string', description: 'Warning if concentration >70%' }
                },
                required: ['riskLevel', 'assessment', 'tip']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'analyze_portfolio_risk' } }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze portfolio');
      }

      const aiResponse = await response.json();
      const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({
            ...result,
            volatilePercent,
            stablePercent
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Action 5: NFT Sentiment Oracle
    if (action === 'nft_sentiment') {
      const systemPrompt = `You are an NFT sentiment analyst with personality. Analyze this NFT:
Name: ${nft.name}
Collection: ${nft.collection}
Rarity: ${nft.rarity}
Traits: ${nft.traits.join(', ')}
Floor Price: Ξ${nft.floorPrice}

Generate a witty "Vibe Check" (max 30 words) that:
1. Assesses sentiment (hot/neutral/cold)
2. Comments on rarity and traits
3. Gives a playful hold/sell signal
4. Includes market trend insight

Be fun and engaging - use crypto slang like "diamond hands", "floor", "HODL"`;

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
            { role: 'user', content: 'Generate NFT sentiment analysis' }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'analyze_nft_sentiment',
              description: 'Analyze NFT sentiment',
              parameters: {
                type: 'object',
                properties: {
                  sentiment: { type: 'string', enum: ['hot', 'neutral', 'cold'] },
                  sentimentEmoji: { type: 'string', description: 'Emoji representing sentiment' },
                  vibeCheck: { type: 'string', description: 'Witty vibe check message (max 30 words)' },
                  marketTrend: { type: 'string', description: 'Market trend insight (max 20 words)' },
                  holdOrSell: { type: 'string', description: 'Hold or sell recommendation (max 10 words)' }
                },
                required: ['sentiment', 'sentimentEmoji', 'vibeCheck', 'marketTrend', 'holdOrSell']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'analyze_nft_sentiment' } }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze NFT sentiment');
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