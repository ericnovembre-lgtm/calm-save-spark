import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

  const sendMessage = useCallback(async (content: string, metadata?: Record<string, any>) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message (assistant) with streaming content
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant') {
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
