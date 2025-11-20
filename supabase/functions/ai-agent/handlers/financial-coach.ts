import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildFinancialContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";
import { determineSubscriptionTier, getSubscriptionMessage } from "../utils/subscription-utils.ts";

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

  // Get subscription info
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('subscription_amount, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tier = determineSubscriptionTier(subscription);
  const subscriptionMsg = getSubscriptionMessage(tier);

  // Get agent system prompt
  const systemPrompt = await getAgentSystemPrompt(supabase, 'financial_coach');

  // Enhance system prompt with current context
  const enhancedPrompt = `${systemPrompt}

**User Subscription Tier:** ${tier}${subscriptionMsg}

**Current User Financial Context:**
${contextString}

Use this context to provide personalized advice. Reference specific data points when relevant.`;

  // Stream AI response
  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'openai/gpt-5-mini'
  );

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
