import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Card = Database['public']['Tables']['cards']['Row'];

export function useCards(accountId?: string) {
  const queryClient = useQueryClient();

  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards', accountId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'frozen']);

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Card[];
    },
    enabled: !!accountId,
  });

  const freezeCardMutation = useMutation({
    mutationFn: async ({ cardId, freeze }: { cardId: string; freeze: boolean }) => {
      const { data, error } = await supabase
        .from('cards')
        .update({
          status: freeze ? 'frozen' : 'active',
          frozen_at: freeze ? new Date().toISOString() : null,
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success(variables.freeze ? 'Card frozen successfully' : 'Card unfrozen successfully');
    },
    onError: (error) => {
      console.error('Error toggling card freeze:', error);
      toast.error('Failed to update card status');
    },
  });

  return {
    cards: cards || [],
    isLoading,
    error,
    freezeCard: (cardId: string, freeze: boolean) => freezeCardMutation.mutate({ cardId, freeze }),
    isFreezingCard: freezeCardMutation.isPending,
  };
}
