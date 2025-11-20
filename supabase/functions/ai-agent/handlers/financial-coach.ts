import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildFinancialContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";
import { determineSubscriptionTier, getSubscriptionMessage } from "../utils/subscription-utils.ts";
import { UI_TOOLS } from "../utils/ui-tools.ts";
import { retrieveMemories, formatMemoriesForContext } from "../utils/memory-manager.ts";
import { getUserDocuments, formatDocumentsForContext } from "../utils/document-processor.ts";

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

  // Load user memories and documents
  const memories = await retrieveMemories(supabase, userId, 'financial_coach');
  const documents = await getUserDocuments(supabase, userId, conversationId);

  // Build financial context
  const context = await buildFinancialContext(supabase, userId);
  const contextString = formatContextForAI(context);
  const memoriesString = formatMemoriesForContext(memories);
  const documentsString = formatDocumentsForContext(documents);

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

${memoriesString}

${documentsString}

**Current User Financial Context:**
${contextString}

**GENERATIVE UI CAPABILITIES:**
You can render interactive UI components! Use these when appropriate:
- render_spending_chart: Show spending trends over time
- render_budget_alert: Warn about budget overruns (use when spending > 70% of limit)
- render_subscription_list: Display active subscriptions
- render_action_card: Suggest actionable steps (transfers, goal creation, etc.)
- render_interactive_goal_builder: Help users create financial goals
- render_cash_flow_sankey: Visualize money flow
- render_net_worth_timeline: Show wealth progression
- render_financial_health_score: Display gamified health score
- render_ai_insights_carousel: Show swipeable insights

Remember user preferences from memory. If documents were uploaded, analyze and reference them.
Use this context to provide personalized advice. Reference specific data points when relevant.`;

  // Stream AI response with UI tools
  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'openai/gpt-5-mini',
    UI_TOOLS,
    supabase,
    conversationId,
    userId
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
