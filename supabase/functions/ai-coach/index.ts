import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit, RATE_LIMITS } from "../_shared/rate-limiter.ts";
import { redisGetJSON, redisSetJSON, redisIncr } from "../_shared/upstash-redis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache TTL: 30 minutes
const CACHE_TTL_SECONDS = 1800;

// Validation schema
const inputSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long"),
  sessionId: z.string().uuid().optional(),
});

// Create a hash for cache key from message
function hashMessage(message: string): string {
  // Simple hash using first 100 chars to create cache key
  const normalized = message.toLowerCase().trim().slice(0, 100);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let userId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'ai-coach');

  // Check for cache bypass
  const url = new URL(req.url);
  const noCache = url.searchParams.get('nocache') === 'true';

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Set user ID for logging
    userId = user.id;
    errorOptions.userId = userId;

    // Check rate limit
    const rateLimitResponse = await enforceRateLimit(
      supabaseClient,
      user.id,
      RATE_LIMITS['ai-coach'],
      corsHeaders
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);

    // Check Redis cache first (unless bypassed)
    const messageHash = hashMessage(validated.message);
    const cacheKey = `ai-coach:${userId}:${messageHash}`;
    
    if (!noCache) {
      const cached = await redisGetJSON<{ message: string; sessionId: string }>(cacheKey);
      if (cached) {
        console.log(`[ai-coach] Cache HIT for user ${userId}, key ${cacheKey}`);
        await redisIncr('ai-coach:cache:hits');
        return new Response(
          JSON.stringify({ 
            success: true,
            message: cached.message,
            sessionId: cached.sessionId
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
              'X-Cache-TTL': CACHE_TTL_SECONDS.toString()
            } 
          }
        );
      }
      console.log(`[ai-coach] Cache MISS for user ${userId}, key ${cacheKey}`);
      await redisIncr('ai-coach:cache:misses');
    } else {
      console.log(`[ai-coach] Cache BYPASS for user ${userId}`);
    }

    // Fetch or create session
    let session;
    if (validated.sessionId) {
      const { data } = await supabaseClient
        .from('ai_coaching_sessions')
        .select('*')
        .eq('id', validated.sessionId)
        .eq('user_id', user.id) // Security: ensure session belongs to user
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('ai_coaching_sessions')
        .insert({
          user_id: user.id,
          session_type: 'general',
          message_count: 0,
          conversation_history: []
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      session = newSession;
    }

    // Fetch user's financial context
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(10);

    const { data: goals } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    const { data: accounts } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0;
    const recentSpending = transactions?.slice(0, 5).map(t => 
      `${t.merchant}: $${t.amount} (${t.category})`
    ).join(', ');

    // Build context for AI
    const context = `You are a helpful financial coach for $ave+. The user has:
- Total balance: $${totalBalance.toFixed(2)}
- ${goals?.length || 0} savings goals
- Recent transactions: ${recentSpending || 'None'}
- ${accounts?.length || 0} connected accounts

Provide personalized, actionable financial advice. Be encouraging and specific.`;

    const conversationHistory = session.conversation_history || [];
    conversationHistory.push({ role: 'user', content: validated.message });

    // Call Lovable AI
    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/lovable-ai`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: context },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || 'I apologize, I encountered an error. Please try again.';

    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    // Update session
    await supabaseClient
      .from('ai_coaching_sessions')
      .update({
        conversation_history: conversationHistory,
        message_count: session.message_count + 1,
        last_message_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // Cache the response in Redis
    const cacheData = { message: assistantMessage, sessionId: session.id };
    await redisSetJSON(cacheKey, cacheData, CACHE_TTL_SECONDS);
    console.log(`[ai-coach] Cached response for user ${userId}, key ${cacheKey}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: assistantMessage,
        sessionId: session.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Cache-TTL': CACHE_TTL_SECONDS.toString()
        } 
      }
    );
  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return handleValidationError(error, errorOptions);
    }
    return handleError(error, errorOptions);
  }
});
