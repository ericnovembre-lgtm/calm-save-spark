import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export function useDigitalTwinChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>();

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message immediately
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the AI agent endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            agent_type: 'digital_twin_advisor',
            message: userMessage,
            conversation_id: conversationId,
            metadata: {
              source: 'digital_twin_page',
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (response.status === 402) {
          toast.error('AI credits depleted. Please add credits to continue.');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let currentAssistantMsg: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add empty assistant message
      setMessages(prev => [...prev, currentAssistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              // Handle model indicator
              if (parsed.type === 'model_indicator') {
                setCurrentModel(parsed.modelName);
                continue;
              }

              // Handle content delta
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = assistantMessage;
                    lastMsg.model = currentModel;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip parse errors for incomplete chunks
            }
          }
        }
      }

      // Generate conversation ID from first exchange
      if (!conversationId && assistantMessage && session?.user) {
        const newConvId = `dt_${Date.now()}_${session.user.id.slice(0, 8)}`;
        setConversationId(newConvId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsStreaming(false);
      setCurrentModel('');
    }
  }, [conversationId, currentModel]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    toast.info('Chat cleared');
  }, []);

  return {
    messages,
    isStreaming,
    currentModel,
    sendMessage,
    clearChat,
  };
}
