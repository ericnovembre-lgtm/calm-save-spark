import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ErrorHandlerOptions, handleError, handleValidationError } from "../_shared/error-handler.ts";
import { enforceRateLimit, RATE_LIMITS } from "../_shared/rate-limiter.ts";
import { withLovableFallback, callLovableAI } from "../_shared/lovable-ai-fallback.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const inputSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long"),
  sessionId: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let userId: string | undefined;
  const errorOptions = new ErrorHandlerOptions(corsHeaders, 'ai-coach');

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

    // Call AI with Lovable AI fallback pattern
    const messages = [
      { role: 'system', content: context },
      ...conversationHistory
    ];

    let assistantMessage: string;
    
    try {
      // Use the shared Lovable AI utility
      const aiResponse = await callLovableAI(messages, {
        model: 'google/gemini-2.5-flash',
        maxTokens: 500,
        temperature: 0.7,
      });
      
      const aiData = await aiResponse.json();
      assistantMessage = aiData.choices?.[0]?.message?.content || 'I apologize, I encountered an error. Please try again.';
    } catch (aiError) {
      console.error('[ai-coach] AI call failed:', aiError);
      assistantMessage = 'I apologize, I encountered an error processing your request. Please try again in a moment.';
    }

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

    return new Response(
      JSON.stringify({ 
        success: true,
        message: assistantMessage,
        sessionId: session.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return handleValidationError(error, errorOptions);
    }
    return handleError(error, errorOptions);
  }
});
