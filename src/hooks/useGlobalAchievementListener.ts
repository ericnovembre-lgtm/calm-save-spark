import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCelebrationTrigger } from './useCelebrationTrigger';

/**
 * Global listener for real-time achievement unlocks.
 * This hook should be used once at the app level to catch all new achievements
 * and trigger the celebration overlay automatically.
 */
export function useGlobalAchievementListener() {
  const queryClient = useQueryClient();
  const { triggerAchievementCelebration } = useCelebrationTrigger();
  const processedIds = useRef<Set<string>>(new Set());

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('global-achievements-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const achievementId = payload.new.achievement_id;
          const recordId = payload.new.id;

          // Prevent duplicate triggers
          if (processedIds.current.has(recordId)) return;
          processedIds.current.add(recordId);

          console.log('[GlobalAchievementListener] New achievement detected:', achievementId);

          // Fetch achievement details
          const { data: achievement, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', achievementId)
            .single();

          if (error) {
            console.error('Error fetching achievement details:', error);
            return;
          }

          if (achievement) {
            // Trigger the celebration overlay
            triggerAchievementCelebration({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              points: achievement.points,
              icon: achievement.icon,
              badge_color: achievement.badge_color,
            });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
            queryClient.invalidateQueries({ queryKey: ['unviewed-achievements-count'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, triggerAchievementCelebration, queryClient]);
}
