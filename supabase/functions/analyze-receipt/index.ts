import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GPT-5 for receipt analysis
const GPT5_MODEL = 'gpt-5-2025-08-07';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagePath } = await req.json();
    
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        global: {
          headers: { Authorization: `Bearer ${authHeader}` },
        },
      }
    );

    const { data: imageData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(imagePath);

    if (downloadError) throw new Error('Failed to download receipt image');

    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Try GPT-5 first for superior receipt analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    let receiptData;
    let modelUsed = 'gpt-5';

    if (openaiApiKey) {
      console.log('[Receipt] Using GPT-5 for analysis');
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GPT5_MODEL,
            messages: [{
              role: 'system',
              content: `You are an expert receipt and invoice analyst. Extract all purchase information accurately.

For receipts, always extract:
- merchant (store/restaurant name)
- purchase_date (YYYY-MM-DD format)
- total_amount (final total)
- subtotal (before tax)
- tax_amount
- category (Groceries, Dining, Transport, Shopping, Bills, Entertainment, Health, Other)
- items (array of {name, price, quantity})
- payment_method (if visible)
- confidence (0-1 score)

Be precise with amounts. If text is unclear, provide best estimate with lower confidence.`
            }, {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this receipt and extract all purchase information.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }],
            max_completion_tokens: 3000,
            tools: [{
              type: 'function',
              function: {
                name: 'extract_receipt_data',
                description: 'Extract structured receipt data',
                parameters: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', description: 'Total amount' },
                    merchant: { type: 'string' },
                    date: { type: 'string', description: 'YYYY-MM-DD format' },
                    category: { 
                      type: 'string',
                      enum: ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
                    },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          price: { type: 'number' },
                          quantity: { type: 'integer' }
                        }
                      }
                    },
                    subtotal: { type: 'number' },
                    tax: { type: 'number' },
                    confidence: { type: 'number' }
                  },
                  required: ['amount', 'merchant', 'category', 'confidence']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_receipt_data' } }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Receipt] GPT-5 error:', response.status, errorText);
          throw new Error(`GPT-5 API error: ${response.status}`);
        }

        const aiData = await response.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          receiptData = JSON.parse(toolCall.function.arguments);
        } else {
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              receiptData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (gptError) {
        console.error('[Receipt] GPT-5 failed, falling back to Gemini:', gptError);
        modelUsed = 'gemini-2.5-flash';
      }
    }

    // Fallback to Lovable AI (Gemini) if GPT-5 unavailable or failed
    if (!receiptData && lovableApiKey) {
      console.log('[Receipt] Using Gemini 2.5 Flash fallback');
      modelUsed = 'gemini-2.5-flash';

      const prompt = `Analyze this receipt and extract information in JSON format:
{
  "amount": <total as number>,
  "merchant": "<store name>",
  "date": "<YYYY-MM-DD>",
  "category": "<Groceries|Dining|Transport|Shopping|Bills|Entertainment|Health|Other>",
  "items": [{"name": "<item>", "price": <number>, "quantity": <number>}],
  "subtotal": <number>,
  "tax": <number>,
  "confidence": <0-1>
}
Return ONLY valid JSON.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error('Could not parse receipt data');
      receiptData = JSON.parse(jsonMatch[0]);
    }

    if (!receiptData) {
      throw new Error('Failed to extract data from receipt');
    }

    // Add metadata
    receiptData.model_used = modelUsed;
    receiptData.analyzed_at = new Date().toISOString();

    console.log('[Receipt] Analysis complete:', { modelUsed, merchant: receiptData.merchant, amount: receiptData.amount });

    return new Response(JSON.stringify(receiptData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-receipt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
