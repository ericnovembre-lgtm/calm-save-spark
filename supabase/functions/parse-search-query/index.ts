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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { query } = await req.json();
    if (!query) {
      throw new Error('Query is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user's recent categories and merchants for context
    const { data: recentData } = await supabaseClient
      .from('transactions')
      .select('category, merchant')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(100);

    const uniqueCategories = [...new Set(recentData?.map(t => t.category).filter(Boolean))];
    const uniqueMerchants = [...new Set(recentData?.map(t => t.merchant).filter(Boolean))];

    const systemPrompt = `You are a financial search query parser. Parse natural language queries into structured transaction filters.

Available categories: ${uniqueCategories.slice(0, 20).join(', ')}
Recent merchants: ${uniqueMerchants.slice(0, 20).join(', ')}

Parse queries like:
- "coffee this month" → category filter + date range
- "spent over $50 at Amazon" → merchant + amount filter
- "groceries last week" → category + date range
- "uber rides in january" → merchant/category + date range

Return ONLY the structured filter object, no explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'parse_search_query',
            description: 'Parse natural language query into structured transaction filters',
            parameters: {
              type: 'object',
              properties: {
                searchQuery: { type: 'string', description: 'Text search for merchant/description' },
                category: { type: 'string', description: 'Transaction category' },
                merchant: { type: 'string', description: 'Merchant name or pattern' },
                amountMin: { type: 'number', description: 'Minimum amount' },
                amountMax: { type: 'number', description: 'Maximum amount' },
                dateRange: {
                  type: 'object',
                  properties: {
                    start: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                    end: { type: 'string', description: 'End date (YYYY-MM-DD)' }
                  }
                }
              },
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'parse_search_query' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status === 402) {
        throw new Error('PAYMENT_REQUIRED');
      }
      throw new Error(`AI Gateway error: ${response.statusText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Failed to parse query');
    }

    const filters = JSON.parse(toolCall.function.arguments);

    // Store search in history
    await supabaseClient.from('transaction_search_history').insert({
      user_id: user.id,
      query,
      parsed_filters: filters,
    });

    return new Response(
      JSON.stringify({ filters, original_query: query }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in parse-search-query:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
