import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildInvestmentContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";
import { determineSubscriptionTier, getSubscriptionMessage } from "../utils/subscription-utils.ts";
import { UI_TOOLS } from "../utils/ui-tools.ts";

async function fetchMarketData(query: string): Promise<string> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  
  if (!PERPLEXITY_API_KEY) {
    console.warn('PERPLEXITY_API_KEY not configured, skipping real-time data fetch');
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
            content: 'Provide current market data and news for the requested topic. Be factual and cite sources when possible.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, await response.text());
      return '';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Failed to fetch market data from Perplexity:', error);
    return '';
  }
}

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function investmentResearchHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  const context = await buildInvestmentContext(supabase, userId);
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

  const systemPrompt = await getAgentSystemPrompt(supabase, 'investment_research');

  // Fetch real-time market data with Perplexity if query suggests it
  let marketData = '';
  const needsRealTimeData = /current|latest|today|now|recent|price|news|update/i.test(message);
  if (needsRealTimeData) {
    console.log('Fetching real-time market data from Perplexity...');
    marketData = await fetchMarketData(message);
  }

  const enhancedPrompt = `${systemPrompt}

**User Subscription Tier:** ${tier}${subscriptionMsg}

**Current Investment Portfolio:**
${contextString}

${marketData ? `**Real-Time Market Data & News:**\n${marketData}\n\n` : ''}

Provide objective analysis and educational insights. Always emphasize this is not financial advice.`;

  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'claude/claude-sonnet-4-5',
    UI_TOOLS
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
          'investment_research',
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
