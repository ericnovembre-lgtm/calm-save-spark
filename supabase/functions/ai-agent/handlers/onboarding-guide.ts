import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildOnboardingContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function onboardingGuideHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  const context = await buildOnboardingContext(supabase, userId);
  const contextString = formatContextForAI(context);

  const systemPrompt = await getAgentSystemPrompt(supabase, 'onboarding_guide');

  const enhancedPrompt = `${systemPrompt}

**Current Onboarding Status:**
${contextString}

Guide the user through their next steps based on their current progress.`;

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
          'onboarding_guide',
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
