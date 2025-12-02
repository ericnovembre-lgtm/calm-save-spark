import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  modelUsed?: {
    model: string;
    modelName: string;
    queryType: string;
  };
}

interface Conversation {
  id: string;
  user_id: string;
  agent_type: string;
  title: string | null;
  conversation_history: any; // Json type from Supabase
  last_message_at: string | null;
  message_count: number;
  created_at: string;
}

export function useCoachConversation(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [isResponding, setIsResponding] = useState(false);
  const [currentModel, setCurrentModel] = useState<{
    model: string;
    modelName: string;
    queryType: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['coach-conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  // Sync messages from conversation
  useState(() => {
    if (conversation?.conversation_history) {
      setMessages((conversation.conversation_history as any as Message[]) || []);
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          agent_type: 'financial_coach',
          conversation_history: [] as any,
          message_count: 0,
          title: 'New Conversation'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      toast.success('New conversation started');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) throw new Error('No active conversation');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      setIsResponding(true);
      setCurrentModel(null);
      
      // Add user message immediately
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId,
            agentType: 'financial_coach'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let currentMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') {
            setIsResponding(false);
            setCurrentModel(null);
            break;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Check for model indicator
            if (parsed.type === 'model_indicator') {
              setCurrentModel({
                model: parsed.model,
                modelName: parsed.modelName,
                queryType: parsed.queryType
              });
              continue;
            }
            
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              currentMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                  newMessages[newMessages.length - 1].content = currentMessage;
                  if (currentModel) {
                    newMessages[newMessages.length - 1].modelUsed = currentModel;
                  }
                } else {
                  newMessages.push({
                    role: 'assistant',
                    content: currentMessage,
                    timestamp: new Date().toISOString(),
                    modelUsed: currentModel || undefined
                  });
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      setIsResponding(false);
    },
    onError: (error) => {
      setIsResponding(false);
      setCurrentModel(null);
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      toast.success('Conversation deleted');
    },
  });

  return {
    conversation,
    messages,
    isLoading,
    isResponding,
    currentModel,
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
  };
}
