import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLatestCreditScore } from "./useLatestCreditScore";
import { useCardTierStatus } from "./useCardTierStatus";

export function useWealthHubStats() {
  const { data: creditScore } = useLatestCreditScore();
  const { tierStatus } = useCardTierStatus();

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['wealth-hub-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('pots')
        .select('id, current_amount, target_amount, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const totalSaved = data?.reduce((sum, pot) => sum + pot.current_amount, 0) || 0;
      const totalTarget = data?.reduce((sum, pot) => sum + pot.target_amount, 0) || 0;
      const activeGoals = data?.length || 0;
      const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

      return {
        totalSaved,
        totalTarget,
        activeGoals,
        overallProgress,
        goals: data || [],
      };
    },
  });

  return {
    totalSaved: goalsData?.totalSaved || 0,
    activeGoals: goalsData?.activeGoals || 0,
    overallProgress: goalsData?.overallProgress || 0,
    creditScore: creditScore?.score || null,
    creditChange: creditScore?.change || 0,
    cardStatus: tierStatus ? 'Active' : 'Pending',
    investmentValue: 0,
    investmentChange: 0,
    nextMilestone: goalsData?.goals?.[0] || null,
    isLoading: goalsLoading,
  };
}
