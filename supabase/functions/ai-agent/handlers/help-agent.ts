import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildHelpContext } from "../utils/context-builder.ts";
import { streamAIResponse, formatContextForAI } from "../utils/ai-client.ts";
import { loadConversation, saveConversation, getAgentSystemPrompt } from "../utils/conversation-manager.ts";
import { SAVEPLUS_FEATURES } from "../knowledge/saveplus-features.ts";

interface HandlerParams {
  supabase: SupabaseClient;
  userId: string;
  message: string;
  conversationId?: string;
  metadata: Record<string, any>;
}

export async function helpAgentHandler(params: HandlerParams): Promise<ReadableStream> {
  const { supabase, userId, message, conversationId, metadata } = params;

  // Load conversation history
  const history = conversationId 
    ? await loadConversation(supabase, conversationId, userId)
    : [];

  // Build help context with subscription info
  const context = await buildHelpContext(supabase, userId);
  const contextString = formatContextForAI(context);

  const systemPrompt = await getAgentSystemPrompt(supabase, 'help_agent');

  // Get current page from metadata
  const currentPage = metadata.currentPage || 'Unknown Page';
  const currentPath = metadata.pathname || '/';

  const enhancedPrompt = `${systemPrompt}

**Current User Context:**
${contextString}

**Current Page:** ${currentPage} (${currentPath})
**Page Description:** ${SAVEPLUS_FEATURES.page_map[currentPath as keyof typeof SAVEPLUS_FEATURES.page_map] || 'User is navigating the app'}

**User's Subscription Tier:** ${context.subscriptionTier || 'Free'}
${context.subscriptionTier === 'Free' ? '⚠️ Limited to basic features. Suggest Premium upgrade when relevant but don\'t be pushy.' : ''}
${context.subscriptionTier === 'Premium' ? '✅ Has access to all AI agents and advanced analytics.' : ''}
${context.subscriptionTier === 'Business' ? '✅ Has access to team features and multi-account management.' : ''}
${context.subscriptionTier === 'Enterprise' ? '✅ Has full access to all features including custom integrations.' : ''}

Provide helpful, context-aware assistance based on their current location and subscription tier. Reference their current page when relevant.`;

  // Use Gemini Flash for fast, efficient support responses
  const aiStream = await streamAIResponse(
    enhancedPrompt, 
    history, 
    message,
    'google/gemini-2.5-flash'
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
          'help_agent',
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
