import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildLifePlanContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function lifePlannerHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  const context = await buildLifePlanContext(supabase, userId);
  const contextString = formatContextForAI(context);

  const systemPrompt = await getAgentSystemPrompt(supabase, 'life_planner');

  const enhancedPrompt = `${systemPrompt}

**Current Life Plans & Goals:**
${contextString}

Help plan for major life events with realistic timelines and comprehensive checklists.`;

  const aiStream = await streamAIResponse(enhancedPrompt, history, message);

  let fullResponse = '';
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      controller.enqueue(chunk);
    },
    async flush() {
      try {
        await saveConversation(
          supabase,
          conversationId,
          userId,
          'life_planner',
          message,
          fullResponse,
          metadata
        );
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    },
  });

  return aiStream.pipeThrough(transformStream);
}
