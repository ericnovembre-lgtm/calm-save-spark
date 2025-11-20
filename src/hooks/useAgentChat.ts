import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComponentMessage } from '@/components/generative-ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  componentData?: ComponentMessage;
}

interface UseAgentChatOptions {
  agentType: string;
  conversationId?: string;
  onMessageReceived?: (message: string) => void;
}

export function useAgentChat({ agentType, conversationId, onMessageReceived }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  const sendMessage = useCallback(async (content: string, metadata?: Record<string, any>, retryCount = 0) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            agent_type: agentType,
            message: content,
            conversation_id: currentConversationId,
            metadata,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          if (retryCount < MAX_RETRIES) {
            toast.info(`Rate limited. Retrying in ${RETRY_DELAY / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return sendMessage(content, metadata, retryCount + 1);
          }
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits depleted. Please contact support to add credits.');
        } else if (response.status >= 500 && retryCount < MAX_RETRIES) {
          // Retry on server errors
          toast.info(`Server error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return sendMessage(content, metadata, retryCount + 1);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to send message');
        }
        // Remove the user message on error
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check for tool call (component rendering)
            const toolCall = parsed.choices?.[0]?.delta?.tool_calls?.[0];
            if (toolCall && toolCall.function) {
              try {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
                
                // Map function name to component type
                const componentTypeMap: Record<string, ComponentMessage['type']> = {
                  'render_spending_chart': 'spending_chart',
                  'render_predictive_forecast': 'predictive_forecast',
                  'render_emotion_aware_response': 'emotion_aware_response',
                  'render_budget_alert': 'budget_alert',
                  'render_subscription_list': 'subscription_list',
                  'render_action_card': 'action_card',
                  'render_interactive_goal_builder': 'interactive_goal_builder',
                  'render_cash_flow_sankey': 'cash_flow_sankey',
                  'render_net_worth_timeline': 'net_worth_timeline',
                  'render_financial_health_score': 'financial_health_score',
                  'render_ai_insights_carousel': 'ai_insights_carousel',
                };
                
                const componentType = componentTypeMap[functionName];
                if (componentType) {
                  // Create component message
                  const componentMessage: Message = {
                    role: 'assistant',
                    content: '',
                    timestamp: new Date().toISOString(),
                    componentData: {
                      type: componentType,
                      props: functionArgs,
                      fallbackText: `[${componentType} component]`
                    }
                  };
                  
                  setMessages(prev => [...prev, componentMessage]);
                  continue;
                }
              } catch (e) {
                console.error('Error processing tool call:', e);
              }
            }
            
            // Regular text content
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;

              // Update the last message (assistant) with streaming content
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant' && !lastMessage.componentData) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: assistantMessage },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date().toISOString(),
                    },
                  ];
                }
              });
            }
          } catch {
            // Incomplete JSON, buffer it
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      onMessageReceived?.(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [agentType, currentConversationId, onMessageReceived]);

  return {
    messages,
    isLoading,
    sendMessage,
    conversationId: currentConversationId,
    setConversationId: setCurrentConversationId,
  };
}
