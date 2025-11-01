import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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

    const { message, sessionId } = await req.json();

    // Fetch or create session
    let session;
    if (sessionId) {
      const { data } = await supabaseClient
        .from('ai_coaching_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession } = await supabaseClient
        .from('ai_coaching_sessions')
        .insert({
          user_id: user.id,
          session_type: 'general',
          message_count: 0,
          conversation_history: []
        })
        .select()
        .single();
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
    conversationHistory.push({ role: 'user', content: message });

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

    return new Response(
      JSON.stringify({ 
        success: true,
        message: assistantMessage,
        sessionId: session.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Coach Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
