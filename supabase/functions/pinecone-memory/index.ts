import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PineconeMetadata {
  userId: string;
  timestamp: number;
  category: string;
  content: string;
  importance: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, memory, query, topK = 5 } = await req.json();
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
    const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');

    if (!PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    if (action === 'store') {
      // Generate embedding using Cohere
      const embedResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cohere-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ texts: [memory.content] }),
      });

      const { embeddings } = await embedResponse.json();
      const embedding = embeddings[0];

      // Store in Pinecone (assuming index is already created)
      const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');
      if (!PINECONE_INDEX_URL) {
        throw new Error('PINECONE_INDEX_URL not configured');
      }
      
      const pineconeResponse = await fetch(
        `${PINECONE_INDEX_URL}/vectors/upsert`,
        {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: [{
              id: `${userId}-${Date.now()}`,
              values: embedding,
              metadata: {
                userId,
                timestamp: Date.now(),
                category: memory.category,
                content: memory.content,
                importance: memory.importance || 1,
              } as PineconeMetadata,
            }],
          }),
        }
      );

      if (!pineconeResponse.ok) {
        throw new Error('Failed to store in Pinecone');
      }

      // Also store in Supabase agent_memory
      await supabaseClient
        .from('agent_memory')
        .insert({
          user_id: userId,
          agent_type: 'financial_memory',
          memory_type: memory.category,
          key: memory.category,
          value: memory.content,
          confidence_score: memory.importance || 1,
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'retrieve') {
      // Generate query embedding
      const embedResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cohere-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ texts: [query] }),
      });

      const { embeddings } = await embedResponse.json();
      const queryEmbedding = embeddings[0];

      // Query Pinecone
      const PINECONE_INDEX_URL = Deno.env.get('PINECONE_INDEX_URL');
      if (!PINECONE_INDEX_URL) {
        throw new Error('PINECONE_INDEX_URL not configured');
      }
      
      const pineconeResponse = await fetch(
        `${PINECONE_INDEX_URL}/query`,
        {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vector: queryEmbedding,
            filter: { userId },
            topK,
            includeMetadata: true,
          }),
        }
      );

      const results = await pineconeResponse.json();

      return new Response(JSON.stringify({ memories: results.matches }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in pinecone-memory:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
