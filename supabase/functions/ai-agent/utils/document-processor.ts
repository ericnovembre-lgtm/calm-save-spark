import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  extractedText?: string;
  structuredData?: Record<string, any>;
  metadata?: Record<string, any>;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export async function processDocument(
  supabase: SupabaseClient,
  documentId: string,
  userId: string,
  lovableApiKey: string
): Promise<ProcessedDocument> {
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
        // Try direct JSON parse
        structuredData = JSON.parse(extractedText);
      }
    } catch {
      // If not JSON, store as text
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

export async function getUserDocuments(
  supabase: SupabaseClient,
  userId: string,
  conversationId?: string
): Promise<ProcessedDocument[]> {
  let query = supabase
    .from('agent_documents')
    .select('*')
    .eq('user_id', userId);

  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data?.map(doc => ({
    id: doc.id,
    fileName: doc.file_name,
    fileType: doc.file_type,
    extractedText: doc.analysis_result?.extractedText,
    structuredData: doc.analysis_result,
    analysisStatus: doc.analysis_status
  })) || [];
}

export function formatDocumentsForContext(documents: ProcessedDocument[]): string {
  if (documents.length === 0) return '';

  let context = '**Uploaded Documents:**\n\n';

  documents.forEach((doc, index) => {
    context += `${index + 1}. **${doc.fileName}** (${doc.fileType})\n`;
    if (doc.structuredData) {
      context += `   Analysis: ${JSON.stringify(doc.structuredData, null, 2)}\n`;
    }
    context += '\n';
  });

  return context;
}
