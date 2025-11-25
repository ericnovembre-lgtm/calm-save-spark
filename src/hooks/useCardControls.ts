import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CardControl = Database['public']['Tables']['card_controls']['Row'];
type CardControlUpdate = Database['public']['Tables']['card_controls']['Update'];

export function useCardControls(accountId?: string) {
  const queryClient = useQueryClient();

  const { data: controls, isLoading, error } = useQuery({
    queryKey: ['card-controls', accountId],
    queryFn: async () => {
      if (!accountId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_controls')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CardControl | null;
    },
    enabled: !!accountId,
  });

  const updateControlsMutation = useMutation({
    mutationFn: async (updates: CardControlUpdate) => {
      if (!accountId || !controls) {
        throw new Error('No card controls found');
      }

      const { data, error } = await supabase
        .from('card_controls')
        .update(updates)
        .eq('id', controls.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-controls', accountId] });
      toast.success('Card controls updated successfully');
    },
    onError: (error) => {
      console.error('Error updating card controls:', error);
      toast.error('Failed to update card controls');
    },
  });

  return {
    controls,
    isLoading,
    error,
    updateControls: (updates: CardControlUpdate) => updateControlsMutation.mutate(updates),
    isUpdating: updateControlsMutation.isPending,
  };
}
