import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentRequest {
  transactionId: string;
  rawMerchant: string;
}

interface EnrichmentResult {
  ai_merchant_name: string;
  ai_category: string;
  ai_confidence: number;
  original_merchant: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId, rawMerchant } = await req.json() as EnrichmentRequest;

    console.log(`Enriching transaction ${transactionId} with merchant: ${rawMerchant}`);

    // Call Lovable AI for merchant enrichment
    const aiResponse = await fetch('https://api.lovable.app/v1/ai-gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'system',
            content: `You are a merchant name cleaner and categorizer for financial transactions. 
Your task is to:
1. Clean the raw merchant name (remove transaction codes, locations, extra info)
2. Categorize the merchant into ONE of these categories: Dining, Shopping, Groceries, Transportation, Entertainment, Travel, Health, Bills, Gas, Other
3. Provide a confidence score (0-1)

Return ONLY valid JSON in this exact format:
{"merchant": "Clean Merchant Name", "category": "Category", "confidence": 0.95}`
          },
          {
            role: 'user',
            content: `Clean and categorize this merchant: "${rawMerchant}"`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';
    
    // Parse AI response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      parsed = {
        merchant: rawMerchant,
        category: 'Other',
        confidence: 0.5
      };
    }

    const result: EnrichmentResult = {
      ai_merchant_name: parsed.merchant || rawMerchant,
      ai_category: parsed.category || 'Other',
      ai_confidence: parsed.confidence || 0.5,
      original_merchant: rawMerchant,
    };

    // Update card_transactions table
    const { error: updateError } = await supabase
      .from('card_transactions')
      .update({
        ai_merchant_name: result.ai_merchant_name,
        ai_category: result.ai_category,
        ai_confidence: result.ai_confidence,
        enrichment_status: 'completed',
        enriched_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    console.log(`Successfully enriched transaction ${transactionId}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enrich-card-transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        ai_merchant_name: null,
        ai_category: 'Other',
        ai_confidence: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
