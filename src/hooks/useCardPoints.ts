import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PointsLedgerEntry = Database['public']['Tables']['card_points_ledger']['Row'];

export function useCardPoints(cardId?: string) {
  const queryClient = useQueryClient();

  const { data: pointsHistory, isLoading, error } = useQuery({
    queryKey: ['card-points', cardId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('card_points_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (cardId) {
        query = query.eq('card_id', cardId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PointsLedgerEntry[];
    },
  });

  // Real-time subscription for points changes
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('card-points-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'card_points_ledger',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Invalidate and refetch when points change
            queryClient.invalidateQueries({ queryKey: ['card-points'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [queryClient]);

  const totalPoints = pointsHistory?.reduce((sum, entry) => sum + entry.points_amount, 0) || 0;

  const pointsByType = pointsHistory?.reduce((acc, entry) => {
    acc[entry.points_type] = (acc[entry.points_type] || 0) + entry.points_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const recentPoints = pointsHistory?.slice(0, 10) || [];

  return {
    pointsHistory: pointsHistory || [],
    totalPoints,
    pointsByType,
    recentPoints,
    isLoading,
    error,
  };
}
