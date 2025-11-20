import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processDocument(
  supabase: any,
  documentId: string,
  userId: string,
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

    // Use Gemini Vision for document understanding
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
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
        max_completion_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Document analysis failed');
    }

    const result = await response.json();
    const extractedText = result.choices[0].message.content;

    // Try to parse structured data from response
    let structuredData: Record<string, any> = {};
    try {
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[1]);
      } else {
        structuredData = JSON.parse(extractedText);
      }
    } catch {
      structuredData = { extractedText };
    }

    // Update document with results
    await supabase
      .from('agent_documents')
      .update({
        analysis_status: 'completed',
        analysis_result: structuredData,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return {
      id: doc.id,
      fileName: doc.file_name,
      fileType: doc.file_type,
      extractedText,
      structuredData,
      analysisStatus: 'completed'
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
    const result = await processDocument(supabase, documentId, user.id, lovableApiKey);

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
