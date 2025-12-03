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
    const { transactionId, rawMerchant } = await req.json();

    if (!rawMerchant) {
      throw new Error('rawMerchant is required');
    }

    // Check cache first
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cached } = await supabase
      .from('merchant_enrichment')
      .select('*')
      .eq('raw_merchant', rawMerchant)
      .single();

    if (cached) {
      // Update usage count
      await supabase
        .from('merchant_enrichment')
        .update({ times_used: cached.times_used + 1 })
        .eq('id', cached.id);

      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Lovable AI to clean merchant name
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a merchant name cleaner. Extract the actual merchant name from messy bank transaction data. Also suggest an appropriate category.',
          },
          {
            role: 'user',
            content: `Clean this merchant name and suggest a category: "${rawMerchant}"`,
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'clean_merchant',
            description: 'Return cleaned merchant name and suggested category',
            parameters: {
              type: 'object',
              properties: {
                cleanedName: { type: 'string', description: 'Cleaned merchant name' },
                category: { 
                  type: 'string', 
                  enum: ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'],
                  description: 'Suggested category' 
                },
                confidence: { type: 'number', description: 'Confidence score 0-1' },
              },
              required: ['cleanedName', 'category', 'confidence'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'clean_merchant' } },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Save to cache
    const { data: enrichment, error } = await supabase
      .from('merchant_enrichment')
      .insert({
        raw_merchant: rawMerchant,
        cleaned_name: result.cleanedName,
        suggested_category: result.category,
        confidence_score: result.confidence,
      })
      .select()
      .single();

    if (error) {
      console.error('Error caching enrichment:', error);
    }

    // Update transaction if ID provided
    if (transactionId && enrichment) {
      await supabase
        .from('transactions')
        .update({
          merchant: result.cleanedName,
          category: result.category,
          enrichment_metadata: {
            ai_cleaned: true,
            confidence: result.confidence,
            original_merchant: rawMerchant,
          },
        })
        .eq('id', transactionId);
    }

    return new Response(JSON.stringify(enrichment || result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enrich-transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});