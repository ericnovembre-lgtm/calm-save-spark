import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SpendRule = Database['public']['Tables']['card_spend_rules']['Row'];
type SpendRuleInsert = Database['public']['Tables']['card_spend_rules']['Insert'];

export function useSpendRules(cardId?: string) {
  const queryClient = useQueryClient();

  const { data: rules, isLoading, error } = useQuery({
    queryKey: ['card-spend-rules', cardId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('card_spend_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cardId) {
        query = query.eq('card_id', cardId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SpendRule[];
    },
    enabled: !!cardId,
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: SpendRuleInsert) => {
      const { data, error } = await supabase
        .from('card_spend_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-spend-rules'] });
      toast.success('Save Rule Created', {
        description: 'Your automatic savings rule is now active'
      });
    },
    onError: (error) => {
      console.error('Error creating spend rule:', error);
      toast.error('Failed to create rule');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SpendRule> }) => {
      const { data, error } = await supabase
        .from('card_spend_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-spend-rules'] });
      toast.success('Rule Updated');
    },
    onError: (error) => {
      console.error('Error updating spend rule:', error);
      toast.error('Failed to update rule');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('card_spend_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-spend-rules'] });
      toast.success('Rule Deleted');
    },
    onError: (error) => {
      console.error('Error deleting spend rule:', error);
      toast.error('Failed to delete rule');
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('card_spend_rules')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card-spend-rules'] });
      toast.success(variables.isActive ? 'Rule Activated' : 'Rule Paused');
    },
    onError: (error) => {
      console.error('Error toggling spend rule:', error);
      toast.error('Failed to update rule');
    },
  });

  return {
    rules: rules || [],
    isLoading,
    error,
    createRule: (rule: SpendRuleInsert) => createRuleMutation.mutate(rule),
    updateRule: (id: string, updates: Partial<SpendRule>) => updateRuleMutation.mutate({ id, updates }),
    deleteRule: (id: string) => deleteRuleMutation.mutate(id),
    toggleRule: (id: string, isActive: boolean) => toggleRuleMutation.mutate({ id, isActive }),
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
    isToggling: toggleRuleMutation.isPending,
  };
}
