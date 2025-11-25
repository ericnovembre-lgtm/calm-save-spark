import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type RedemptionCatalog = Database['public']['Tables']['redemption_catalog']['Row'];
type PointsRedemption = Database['public']['Tables']['points_redemptions']['Row'];

export function usePointsRedemption() {
  const queryClient = useQueryClient();

  // Fetch redemption catalog
  const catalogQuery = useQuery({
    queryKey: ['redemption-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redemption_catalog')
        .select('*')
        .eq('is_active', true)
        .order('redemption_type, points_cost');

      if (error) throw error;
      return data as RedemptionCatalog[];
    },
  });

  // Fetch user's redemption history
  const historyQuery = useQuery({
    queryKey: ['redemption-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('points_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PointsRedemption[];
    },
  });

  // Redeem points mutation
  const redeemMutation = useMutation({
    mutationFn: async (catalogItemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('redeem-points', {
        body: { catalogItemId, userId: user.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemption-history'] });
      queryClient.invalidateQueries({ queryKey: ['card-tier-status'] });
      queryClient.invalidateQueries({ queryKey: ['card-points'] });
      
      toast.success('🎉 Redemption successful!', {
        description: `You have ${data.remaining_points} points remaining`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error('Redemption error:', error);
      toast.error('Redemption failed', {
        description: error.message || 'Please try again later',
      });
    },
  });

  return {
    catalog: catalogQuery.data || [],
    history: historyQuery.data || [],
    isLoadingCatalog: catalogQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    redeem: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
  };
}
