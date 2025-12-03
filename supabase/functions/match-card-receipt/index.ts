import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagePath, userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download receipt image
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(imagePath);

    if (downloadError) throw downloadError;

    // Convert to base64
    const buffer = await imageData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Use Lovable AI to extract receipt data
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract merchant name, total amount, date, and line items from this receipt. Return only valid JSON with format: {"merchant": "...", "amount": 0.00, "date": "YYYY-MM-DD", "items": [{"name": "...", "price": 0.00}]}'
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64}` }
            }
          ]
        }],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_receipt',
            parameters: {
              type: 'object',
              properties: {
                merchant: { type: 'string' },
                amount: { type: 'number' },
                date: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      price: { type: 'number' }
                    },
                    required: ['name', 'price']
                  }
                }
              },
              required: ['merchant', 'amount', 'date']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'extract_receipt' } }
      }),
    });

    const aiData = await aiResponse.json();
    const extractedData = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

    console.log('Extracted receipt data:', extractedData);

    // Find matching card transactions
    const receiptDate = new Date(extractedData.date);
    const startDate = new Date(receiptDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(receiptDate);
    endDate.setDate(endDate.getDate() + 3);

    const amountCents = Math.round(extractedData.amount * 100);
    const minAmount = amountCents - 50; // $0.50 tolerance
    const maxAmount = amountCents + 50;

    const { data: candidates, error: queryError } = await supabase
      .from('card_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())
      .gte('amount_cents', minAmount)
      .lte('amount_cents', maxAmount)
      .is('receipt_image_path', null);

    if (queryError) throw queryError;

    // Calculate match confidence for each candidate
    const matches = candidates.map(tx => {
      const merchantMatch = calculateMerchantSimilarity(
        extractedData.merchant,
        tx.ai_merchant_name || tx.merchant_name || ''
      );
      const amountMatch = 1 - (Math.abs(tx.amount_cents - amountCents) / amountCents);
      const dateMatch = 1 - (Math.abs(new Date(tx.transaction_date).getTime() - receiptDate.getTime()) / (3 * 24 * 60 * 60 * 1000));
      
      const confidence = (merchantMatch * 0.5 + amountMatch * 0.3 + dateMatch * 0.2);
      
      return {
        transaction: tx,
        confidence,
        matchDetails: { merchantMatch, amountMatch, dateMatch }
      };
    }).sort((a, b) => b.confidence - a.confidence);

    // Auto-link if confidence > 0.85
    if (matches.length > 0 && matches[0].confidence > 0.85) {
      const { error: updateError } = await supabase
        .from('card_transactions')
        .update({
          receipt_image_path: imagePath,
          receipt_matched_at: new Date().toISOString(),
          receipt_match_confidence: matches[0].confidence,
          receipt_extracted_data: extractedData,
          receipt_verified: true
        })
        .eq('id', matches[0].transaction.id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        matched: true,
        transaction: matches[0].transaction,
        confidence: matches[0].confidence,
        extractedData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return candidates for manual matching
    return new Response(JSON.stringify({
      matched: false,
      candidates: matches.slice(0, 5),
      extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in match-card-receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateMerchantSimilarity(merchant1: string, merchant2: string): number {
  const m1 = merchant1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const m2 = merchant2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (m1 === m2) return 1;
  if (m1.includes(m2) || m2.includes(m1)) return 0.8;
  
  // Levenshtein distance approximation
  const longer = m1.length > m2.length ? m1 : m2;
  const shorter = m1.length > m2.length ? m2 : m1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = [...shorter].reduce((acc, char, i) => 
    acc + (longer[i] !== char ? 1 : 0), 0
  );
  
  return Math.max(0, 1 - editDistance / longer.length);
}