import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemoryPayload {
  action: 'store' | 'retrieve';
  content?: string;
  category?: 'scenario' | 'insight' | 'preference' | 'pattern' | 'conversation';
  importance?: number;
  query?: string;
  topK?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const payload: MemoryPayload = await req.json();
    const { action, content, category = 'conversation', importance = 0.5, query, topK = 5 } = payload;

    if (action === 'store' && content) {
      // Generate embedding via Cohere
      const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
      if (!COHERE_API_KEY) throw new Error('COHERE_API_KEY not configured');

      const embedResponse = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [content],
          model: 'embed-english-v3.0',
          input_type: 'search_document',
        }),
      });

      if (!embedResponse.ok) {
        throw new Error('Failed to generate embedding');
      }

      const embedData = await embedResponse.json();
      const vector = embedData.embeddings[0];

      // Store in Pinecone
      const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
      const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');
      
      if (!PINECONE_API_KEY || !PINECONE_INDEX_URL) {
        throw new Error('Pinecone not configured');
      }

      const memoryId = `dt_${user.id}_${Date.now()}`;
      
      const pineconeResponse = await fetch(`${PINECONE_INDEX_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: [{
            id: memoryId,
            values: vector,
            metadata: {
              user_id: user.id,
              content,
              category,
              importance,
              agent_type: 'digital_twin',
              created_at: new Date().toISOString(),
            },
          }],
          namespace: 'digital_twin_memories',
        }),
      });

      if (!pineconeResponse.ok) {
        console.error('Pinecone upsert error:', await pineconeResponse.text());
        throw new Error('Failed to store in Pinecone');
      }

      // Also store locally for quick access
      await supabase.from('agent_memory').insert({
        user_id: user.id,
        agent_type: 'digital_twin',
        memory_type: category,
        key: memoryId,
        value: { content, importance },
        confidence_score: importance,
      });

      console.log(`Stored Digital Twin memory: ${memoryId}`);

      return new Response(JSON.stringify({ success: true, memoryId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'retrieve' && query) {
      // Generate query embedding
      const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
      if (!COHERE_API_KEY) throw new Error('COHERE_API_KEY not configured');

      const embedResponse = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [query],
          model: 'embed-english-v3.0',
          input_type: 'search_query',
        }),
      });

      if (!embedResponse.ok) {
        throw new Error('Failed to generate query embedding');
      }

      const embedData = await embedResponse.json();
      const queryVector = embedData.embeddings[0];

      // Query Pinecone
      const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
      const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');
      
      if (!PINECONE_API_KEY || !PINECONE_INDEX_URL) {
        throw new Error('Pinecone not configured');
      }

      const searchResponse = await fetch(`${PINECONE_INDEX_URL}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector: queryVector,
          topK,
          includeMetadata: true,
          namespace: 'digital_twin_memories',
          filter: { user_id: { $eq: user.id } },
        }),
      });

      if (!searchResponse.ok) {
        console.error('Pinecone query error:', await searchResponse.text());
        throw new Error('Failed to query Pinecone');
      }

      const searchData = await searchResponse.json();
      
      const memories = (searchData.matches || []).map((match: any) => ({
        id: match.id,
        score: match.score,
        content: match.metadata?.content,
        category: match.metadata?.category,
        importance: match.metadata?.importance,
        createdAt: match.metadata?.created_at,
      }));

      console.log(`Retrieved ${memories.length} Digital Twin memories for query`);

      return new Response(JSON.stringify({ memories }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action or missing parameters');

  } catch (error) {
    console.error('Digital Twin Memory error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
