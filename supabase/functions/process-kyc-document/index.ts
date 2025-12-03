import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GPT-5 for KYC document analysis
const GPT5_MODEL = 'gpt-5-2025-08-07';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentUrl } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try GPT-5 first for superior KYC document analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    let extractedData;
    let modelUsed = 'gpt-5';
    
    if (openaiApiKey) {
      console.log('[KYC Document] Using GPT-5 for analysis');
      
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
              content: `You are an expert KYC document analyst. Extract identity information accurately while flagging any potential issues with document authenticity.

For identity documents, always extract:
- document_type (passport, driver_license, national_id, utility_bill, bank_statement, etc.)
- full_name (as shown on document)
- date_of_birth (YYYY-MM-DD format)
- document_number
- issue_date and expiration_date
- address (if present)
- issuing_authority
- nationality (if applicable)
- confidence (0-1 score)
- potential_issues (array of any concerns)

Be precise and flag any signs of tampering, poor quality, or inconsistencies.`
            }, {
              role: 'user',
              content: `Analyze this KYC/identity document and extract all relevant information. Document URL: ${documentUrl}`
            }],
            max_completion_tokens: 3000,
            tools: [{
              type: 'function',
              function: {
                name: 'extract_kyc_data',
                description: 'Extract structured KYC document data',
                parameters: {
                  type: 'object',
                  properties: {
                    document_type: { type: 'string' },
                    full_name: { type: 'string' },
                    date_of_birth: { type: 'string' },
                    document_number: { type: 'string' },
                    issue_date: { type: 'string' },
                    expiration_date: { type: 'string' },
                    address: { type: 'string' },
                    issuing_authority: { type: 'string' },
                    nationality: { type: 'string' },
                    confidence: { type: 'number' },
                    potential_issues: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['document_type', 'full_name', 'confidence']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_kyc_data' } }
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('[KYC Document] GPT-5 error:', aiResponse.status, errorText);
          throw new Error(`GPT-5 API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          extractedData = JSON.parse(toolCall.function.arguments);
        } else {
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              extractedData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (gptError) {
        console.error('[KYC Document] GPT-5 failed, falling back to Gemini:', gptError);
        modelUsed = 'gemini-3-pro';
      }
    }

    // Fallback to Lovable AI (Gemini) if GPT-5 unavailable or failed
    if (!extractedData && lovableApiKey) {
      console.log('[KYC Document] Using Gemini 3 Pro fallback');
      modelUsed = 'gemini-3-pro';
      
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Analyze this KYC document and extract: document_type, name, date_of_birth, address, document_number. Return as JSON. Document URL: ${documentUrl}`
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
          extractedData = JSON.parse(jsonMatch[0]);
        }
      }
    }

    if (!extractedData) {
      throw new Error('Failed to extract data from KYC document');
    }

    // Add metadata
    extractedData.model_used = modelUsed;
    extractedData.verified_at = new Date().toISOString();

    // Determine verification status based on confidence and issues
    const hasIssues = extractedData.potential_issues?.length > 0;
    const confidence = extractedData.confidence || 0;
    const verificationStatus = confidence >= 0.8 && !hasIssues ? 'verified' : confidence >= 0.5 ? 'pending_review' : 'rejected';

    // Update verification record
    await supabase
      .from('kyc_verifications')
      .update({
        extracted_data: extractedData,
        verification_status: verificationStatus
      })
      .eq('id', documentId);

    console.log('[KYC Document] Processing complete:', { documentId, modelUsed, verificationStatus });

    return new Response(JSON.stringify({ success: true, extractedData, modelUsed, verificationStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('KYC processing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
