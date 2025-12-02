import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GoalsProgress {
  overallProgress: number;
  totalSaved: number;
  totalTarget: number;
  activeGoalsCount: number;
}

export function useGoalsProgress() {
  return useQuery({
    queryKey: ['goals-progress'],
    queryFn: async (): Promise<GoalsProgress> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          overallProgress: 0,
          totalSaved: 0,
          totalTarget: 0,
          activeGoalsCount: 0,
        };
      }

      const { data: pots, error } = await supabase
        .from('pots')
        .select('current_amount, target_amount, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const totalSaved = pots?.reduce((sum, pot) => sum + pot.current_amount, 0) || 0;
      const totalTarget = pots?.reduce((sum, pot) => sum + pot.target_amount, 0) || 0;
      const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

      return {
        overallProgress: Math.min(overallProgress, 100),
        totalSaved,
        totalTarget,
        activeGoalsCount: pots?.length || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
