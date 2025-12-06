import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useGamificationBadgeCount() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  // Fetch unviewed achievements (earned in last 7 days without viewed flag)
  const { data: unviewedAchievements = 0 } = useQuery({
    queryKey: ['unviewed-achievements-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('earned_at', sevenDaysAgo.toISOString());
      
      if (error) {
        console.error('Error fetching unviewed achievements:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active challenges the user has joined
  const { data: activeChallenges = 0 } = useQuery({
    queryKey: ['active-challenges-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_completed', false);
      
      if (error) {
        console.error('Error fetching active challenges:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });

  const totalBadgeCount = unviewedAchievements + activeChallenges;

  return {
    unviewedAchievements,
    activeChallenges,
    totalBadgeCount,
  };
}
