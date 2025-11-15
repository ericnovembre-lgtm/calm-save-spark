import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function loadConversation(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('conversation_history')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error loading conversation:', error);
    return [];
  }

  return (data?.conversation_history as Message[]) || [];
}

export async function saveConversation(
  supabase: SupabaseClient,
  conversationId: string | undefined,
  userId: string,
  agentType: string,
  userMessage: string,
  assistantMessage: string,
  metadata: Record<string, any>
): Promise<string> {
  const timestamp = new Date().toISOString();

  if (conversationId) {
    // Update existing conversation
    const { data: existing } = await supabase
      .from('ai_conversations')
      .select('conversation_history, message_count')
      .eq('id', conversationId)
      .single();

    const history = (existing?.conversation_history as Message[]) || [];
    const newHistory = [
      ...history,
      { role: 'user' as const, content: userMessage, timestamp },
      { role: 'assistant' as const, content: assistantMessage, timestamp },
    ];

    await supabase
      .from('ai_conversations')
      .update({
        conversation_history: newHistory,
        message_count: (existing?.message_count || 0) + 2,
        last_message_at: timestamp,
        updated_at: timestamp,
      })
      .eq('id', conversationId);

    return conversationId;
  } else {
    // Create new conversation
    const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        agent_type: agentType,
        title,
        conversation_history: [
          { role: 'user', content: userMessage, timestamp },
          { role: 'assistant', content: assistantMessage, timestamp },
        ],
        metadata,
        message_count: 2,
        last_message_at: timestamp,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data.id;
  }
}

export async function getAgentSystemPrompt(
  supabase: SupabaseClient,
  agentType: string
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_agents')
    .select('system_prompt')
    .eq('agent_type', agentType)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(`Agent ${agentType} not found or inactive`);
  }

  return data.system_prompt;
}
