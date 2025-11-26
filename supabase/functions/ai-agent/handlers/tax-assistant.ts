import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildTaxContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";
import { determineSubscriptionTier, getSubscriptionMessage } from "../utils/subscription-utils.ts";
import { getActiveABTest, selectModelForTest, logTestResult } from "../utils/ab-testing.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

async function fetchTaxUpdates(query: string): Promise<string> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  if (!PERPLEXITY_API_KEY) {
    console.warn('Perplexity API key not configured for tax updates');
    return '';
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a tax law expert. Provide concise, accurate information about recent IRS guidance and tax law updates.'
          },
          {
            role: 'user',
            content: `Find recent IRS guidance and tax law updates relevant to: ${query}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status);
      return '';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error fetching tax updates:', error);
    return '';
  }
}

export async function taxAssistantHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  const startTime = Date.now();

  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  const context = await buildTaxContext(supabase, userId);
  const contextString = formatContextForAI(context);

  // Fetch real-time tax updates via Perplexity
  const taxUpdates = await fetchTaxUpdates(message);

  // Get subscription info
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('subscription_amount, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tier = determineSubscriptionTier(subscription);
  const subscriptionMsg = getSubscriptionMessage(tier, tier === 'Free');

  const systemPrompt = await getAgentSystemPrompt(supabase, 'tax_assistant');

  // Build enhanced prompt with real-time tax updates
  const enhancedPrompt = `${systemPrompt}

**User Subscription Tier:** ${tier}${subscriptionMsg}

**Current Tax Year Context (${context.taxYear}):**
${contextString}

${taxUpdates ? `**Recent Tax Law Updates & IRS Guidance:**
${taxUpdates}` : ''}

Analyze transactions for potential deductions and provide tax-saving recommendations. Consider recent tax law changes if applicable.`;

  // Use Claude 4 Sonnet for tax assistant (no A/B testing)
  const selectedModel = 'claude/claude-sonnet-4-5';
  const testId: string | undefined = undefined;

  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    selectedModel
  );

  let fullResponse = '';
  let tokenCount = 0;
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      tokenCount += text.split(/\s+/).length; // Rough token estimation
      controller.enqueue(chunk);
    },
    async flush() {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      try {
        // Save conversation
        const newConversationId = await saveConversation(
          supabase,
          conversationId,
          userId,
          'tax_assistant',
          message,
          fullResponse,
          metadata
        );

        // Log A/B test result if applicable
        if (testId) {
          await logTestResult(supabase, {
            testId,
            userId,
            agentType: 'tax_assistant',
            modelUsed: selectedModel,
            conversationId: newConversationId,
            responseTimeMs: responseTime,
            tokenCount,
            metadata: {
              had_tax_updates: !!taxUpdates,
              subscription_tier: tier,
            },
          });
        }
      } catch (error) {
        console.error('Error saving conversation or test result:', error);
      }
    },
  });

  return aiStream.pipeThrough(transformStream);
}
