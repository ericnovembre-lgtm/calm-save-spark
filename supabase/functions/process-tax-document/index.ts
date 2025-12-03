import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GPT-5 for tax document analysis
const GPT5_MODEL = 'gpt-5-2025-08-07';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentUrl, fileName } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try GPT-5 first for superior document analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    let parsedData;
    let modelUsed = 'gpt-5';
    
    if (openaiApiKey) {
      console.log('[Tax Document] Using GPT-5 for analysis');
      
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GPT5_MODEL,
            messages: [{
              role: 'system',
              content: `You are an expert tax document analyst. Extract all relevant information accurately and return structured JSON.
              
For tax documents, always extract:
- document_type (w2, 1099-MISC, 1099-NEC, 1099-INT, 1099-DIV, K-1, Schedule C, etc.)
- tax_year
- payer_name and payer_ein
- recipient_name and recipient_ssn_last4
- All income amounts by box number
- All tax withholdings
- deduction_categories (array of applicable categories)
- amounts (object with all numeric values)
- confidence (0-1 score)

Be precise and never hallucinate values. If uncertain, mark fields as "unclear" with lower confidence.`
            }, {
              role: 'user',
              content: `Analyze this tax document and extract all information. Document URL: ${documentUrl}\nFile name: ${fileName}`
            }],
            max_completion_tokens: 4000,
            tools: [{
              type: 'function',
              function: {
                name: 'extract_tax_data',
                description: 'Extract structured tax document data',
                parameters: {
                  type: 'object',
                  properties: {
                    document_type: { type: 'string' },
                    tax_year: { type: 'integer' },
                    payer_name: { type: 'string' },
                    payer_ein: { type: 'string' },
                    recipient_name: { type: 'string' },
                    recipient_ssn_last4: { type: 'string' },
                    wages: { type: 'number' },
                    federal_tax_withheld: { type: 'number' },
                    state_tax_withheld: { type: 'number' },
                    social_security_wages: { type: 'number' },
                    social_security_tax: { type: 'number' },
                    medicare_wages: { type: 'number' },
                    medicare_tax: { type: 'number' },
                    deduction_categories: { type: 'array', items: { type: 'string' } },
                    amounts: { type: 'object', additionalProperties: { type: 'number' } },
                    confidence: { type: 'number' }
                  },
                  required: ['document_type', 'tax_year', 'confidence']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_tax_data' } }
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('[Tax Document] GPT-5 error:', aiResponse.status, errorText);
          throw new Error(`GPT-5 API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          parsedData = JSON.parse(toolCall.function.arguments);
        } else {
          // Fallback to parsing content directly
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (gptError) {
        console.error('[Tax Document] GPT-5 failed, falling back to Gemini:', gptError);
        modelUsed = 'gemini-3-pro';
      }
    }

    // Fallback to Lovable AI (Gemini) if GPT-5 unavailable or failed
    if (!parsedData && lovableApiKey) {
      console.log('[Tax Document] Using Gemini 3 Pro fallback');
      modelUsed = 'gemini-3-pro';
      
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
            content: `Analyze this tax document. Extract: document_type (w2/1099/receipt), tax_year, payer_name, amounts, deduction_categories. Return JSON. URL: ${documentUrl}`
          }],
          stream: false
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`Gemini API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }
    }

    if (!parsedData) {
      throw new Error('Failed to extract data from tax document');
    }

    // Add metadata
    parsedData.model_used = modelUsed;
    parsedData.processed_at = new Date().toISOString();

    await supabase
      .from('tax_documents')
      .update({
        parsed_data: parsedData,
        processing_status: 'completed'
      })
      .eq('id', documentId);

    console.log('[Tax Document] Processing complete:', { documentId, modelUsed });

    return new Response(JSON.stringify({ success: true, parsedData, modelUsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Tax document processing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
