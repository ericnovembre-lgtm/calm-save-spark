import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CategoryRule {
  id: string;
  user_id: string;
  merchant_pattern: string;
  assigned_category: string;
  priority: number;
  is_active: boolean;
  match_count: number;
  created_at: string;
  updated_at: string;
}

interface CreateRuleInput {
  merchant_pattern: string;
  assigned_category: string;
  priority?: number;
}

export function useCategoryRules() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['category-rules', userId],
    queryFn: async (): Promise<CategoryRule[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('smart_category_rules')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const createRule = useMutation({
    mutationFn: async (input: CreateRuleInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('smart_category_rules')
        .insert({
          user_id: userId,
          merchant_pattern: input.merchant_pattern,
          assigned_category: input.assigned_category,
          priority: input.priority || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-rules'] });
      toast.success('Category rule created');
    },
    onError: () => {
      toast.error('Failed to create rule');
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CategoryRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('smart_category_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-rules'] });
      toast.success('Rule updated');
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('smart_category_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-rules'] });
      toast.success('Rule deleted');
    },
  });

  return {
    rules: rules || [],
    isLoading,
    createRule,
    updateRule,
    deleteRule,
  };
}
