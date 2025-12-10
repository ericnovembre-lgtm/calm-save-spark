import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MerchantMapping {
  id: string;
  user_id: string;
  merchant_name: string;
  display_name: string | null;
  category: string;
  logo_url: string | null;
  created_at: string;
}

interface CreateMappingInput {
  merchant_name: string;
  display_name?: string;
  category: string;
  logo_url?: string;
}

export function useMerchantMappings() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['merchant-mappings', userId],
    queryFn: async (): Promise<MerchantMapping[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('merchant_mappings')
        .select('*')
        .eq('user_id', userId)
        .order('merchant_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const createMapping = useMutation({
    mutationFn: async (input: CreateMappingInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('merchant_mappings')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-mappings'] });
      toast.success('Merchant mapping created');
    },
    onError: () => {
      toast.error('Failed to create mapping');
    },
  });

  const updateMapping = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MerchantMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('merchant_mappings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-mappings'] });
      toast.success('Mapping updated');
    },
  });

  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('merchant_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-mappings'] });
      toast.success('Mapping deleted');
    },
  });

  return {
    mappings: mappings || [],
    isLoading,
    createMapping,
    updateMapping,
    deleteMapping,
  };
}
