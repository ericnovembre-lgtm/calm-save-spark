import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildTaxContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function taxAssistantHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  const context = await buildTaxContext(supabase, userId);
  const contextString = formatContextForAI(context);

  const systemPrompt = await getAgentSystemPrompt(supabase, 'tax_assistant');

  const enhancedPrompt = `${systemPrompt}

**Current Tax Year Context (${context.taxYear}):**
${contextString}

Analyze transactions for potential deductions and provide tax-saving recommendations.`;

  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'openai/gpt-5'
  );

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
          'tax_assistant',
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
