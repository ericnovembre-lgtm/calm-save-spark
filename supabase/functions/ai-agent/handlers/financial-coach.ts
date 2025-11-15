import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildFinancialContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function financialCoachHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  // Load conversation history
  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  // Build financial context
  const context = await buildFinancialContext(supabase, userId);
  const contextString = formatContextForAI(context);

  // Get agent system prompt
  const systemPrompt = await getAgentSystemPrompt(supabase, 'financial_coach');

  // Enhance system prompt with current context
  const enhancedPrompt = `${systemPrompt}

**Current User Financial Context:**
${contextString}

Use this context to provide personalized advice. Reference specific data points when relevant.`;

  // Stream AI response
  const aiStream = await streamAIResponse(enhancedPrompt, history, message);

  // Create a transform stream to capture the full response
  let fullResponse = '';
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      controller.enqueue(chunk);
    },
    async flush() {
      // Save conversation after stream completes
      try {
        await saveConversation(
          supabase,
          conversationId,
          userId,
          'financial_coach',
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
