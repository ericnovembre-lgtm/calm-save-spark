import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
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

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coach-conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      setIsResponding(false);
    },
    onError: (error) => {
      setIsResponding(false);
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

  const messages = (conversation?.conversation_history as any as Message[]) || [];

  return {
    conversation,
    messages,
    isLoading,
    isResponding,
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
  };
}
