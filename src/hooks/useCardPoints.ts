import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PointsLedgerEntry = Database['public']['Tables']['card_points_ledger']['Row'];

export function useCardPoints(cardId?: string) {
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
