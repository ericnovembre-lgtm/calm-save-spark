import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GPT-5 for document analysis
const GPT5_MODEL = 'gpt-5-2025-08-07';

async function processDocument(
  supabase: any,
  documentId: string,
  userId: string,
  openaiApiKey: string | undefined,
  lovableApiKey: string
) {
  // Get document details
  const { data: doc, error: docError } = await supabase
    .from('agent_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (docError || !doc) {
    throw new Error('Document not found');
  }

  // Update status to processing
  await supabase
    .from('agent_documents')
    .update({ analysis_status: 'processing' })
    .eq('id', documentId);

  try {
    // Get document from storage
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('tax-documents')
      .download(doc.storage_path);

    if (storageError || !fileData) {
      throw new Error('Failed to download document');
    }

    // Convert to base64 for vision API
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    let extractedText = '';
    let structuredData: Record<string, any> = {};
    let modelUsed = 'gpt-5';

    // Try GPT-5 first for superior document analysis
    if (openaiApiKey) {
      console.log('[Document] Using GPT-5 for analysis');
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: GPT5_MODEL,
            messages: [{
              role: 'system',
              content: `You are an expert financial document analyst. Extract all relevant information from documents and return structured JSON data.

For any financial document, extract:
- document_type (tax form, bank statement, invoice, receipt, etc.)
- key_figures (object with all numeric values found)
- dates (array of relevant dates)
- parties (object with names of involved parties)
- summary (brief description of the document)
- confidence (0-1 score)
- relevant_details (any other important information)

Be thorough and accurate. Include all financial figures you can identify.`
            }, {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this financial document and extract all relevant information. File name: ${doc.file_name}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${doc.file_type};base64,${base64}`
                  }
                }
              ]
            }],
            max_completion_tokens: 4000,
            tools: [{
              type: 'function',
              function: {
                name: 'extract_document_data',
                description: 'Extract structured data from financial document',
                parameters: {
                  type: 'object',
                  properties: {
                    document_type: { type: 'string' },
                    key_figures: { type: 'object', additionalProperties: { type: 'number' } },
                    dates: { type: 'array', items: { type: 'string' } },
                    parties: { type: 'object', additionalProperties: { type: 'string' } },
                    summary: { type: 'string' },
                    confidence: { type: 'number' },
                    relevant_details: { type: 'object' }
                  },
                  required: ['document_type', 'summary', 'confidence']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_document_data' } }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Document] GPT-5 error:', response.status, errorText);
          throw new Error(`GPT-5 API error: ${response.status}`);
        }

        const result = await response.json();
        const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          structuredData = JSON.parse(toolCall.function.arguments);
          extractedText = structuredData.summary || '';
        } else {
          extractedText = result.choices?.[0]?.message?.content || '';
          const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[1]);
          } else {
            try {
              structuredData = JSON.parse(extractedText);
            } catch {
              structuredData = { extractedText, confidence: 0.6 };
            }
          }
        }
      } catch (gptError) {
        console.error('[Document] GPT-5 failed, falling back to Gemini:', gptError);
        modelUsed = 'gemini-2.5-flash';
      }
    }

    // Fallback to Lovable AI (Gemini) if GPT-5 unavailable or failed
    if (modelUsed === 'gemini-2.5-flash' || (!openaiApiKey && lovableApiKey)) {
      console.log('[Document] Using Gemini 2.5 Flash');
      modelUsed = 'gemini-2.5-flash';

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this financial document. Extract all relevant information and return structured data. 
Include: document type, key figures, dates, parties involved, and any other relevant details.
Format as JSON with clear field names.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${doc.file_type};base64,${base64}`
                  }
                }
              ]
            }
          ],
        })
      });

      if (!response.ok) {
        throw new Error('Document analysis failed');
      }

      const result = await response.json();
      extractedText = result.choices?.[0]?.message?.content || '';

      // Try to parse structured data from response
      try {
        const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[1]);
        } else {
          structuredData = JSON.parse(extractedText);
        }
      } catch {
        structuredData = { extractedText, confidence: 0.5 };
      }
    }

    // Add metadata
    structuredData.model_used = modelUsed;
    structuredData.analyzed_at = new Date().toISOString();

    // Update document with results
    await supabase
      .from('agent_documents')
      .update({
        analysis_status: 'completed',
        analysis_result: structuredData,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    console.log('[Document] Processing complete:', { documentId, modelUsed });

    return {
      id: doc.id,
      fileName: doc.file_name,
      fileType: doc.file_type,
      extractedText,
      structuredData,
      analysisStatus: 'completed',
      modelUsed
    };

  } catch (error) {
    console.error('Document processing error:', error);
    
    await supabase
      .from('agent_documents')
      .update({ analysis_status: 'failed' })
      .eq('id', documentId);

    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error('Missing documentId');
    }

    // Process the document
    const result = await processDocument(supabase, documentId, user.id, openaiApiKey, lovableApiKey);

    return new Response(
      JSON.stringify({ success: true, document: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
