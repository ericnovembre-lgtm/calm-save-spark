import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptics';
import { useCelebrationSounds } from './useCelebrationSounds';

/**
 * Hook for optimistic UI updates with ACID-compliant backend
 * Provides instant feedback while ensuring data consistency
 */
export const useOptimisticGoalUpdate = (goalId: string) => {
  const queryClient = useQueryClient();
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();

  const contribute = async (amount: number, note?: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Optimistic update
    queryClient.setQueryData(['goals'], (old: any) => {
      if (!old) return old;
      return old.map((g: any) =>
        g.id === goalId
          ? { ...g, current_amount: Math.min(g.current_amount + amount, g.target_amount) }
          : g
      );
    });

    try {
      // Call ACID-compliant backend function
      const { data, error } = await supabase.rpc('contribute_to_goal', {
        p_goal_id: goalId,
        p_amount: amount,
        p_user_id: user.id,
        p_note: note || ''
      });

      if (error) throw error;

      const { new_amount, is_completed } = data[0];

      // Celebration effects
      if (is_completed) {
        playSuccessChime();
        haptics.achievementUnlocked();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#d6c8a2']
        });
        toast.success('🎉 Goal Completed!', {
          description: 'Congratulations! You reached your target!'
        });
      } else {
        // Coin shower effect
        const particleCount = Math.min(Math.floor(amount / 10), 50);
        playConfettiPop();
        haptics.buttonPress();
        confetti({
          particleCount,
          angle: 90,
          spread: 45,
          origin: { y: 0 },
          colors: ['#FFD700', '#FFA500', '#d6c8a2'],
          shapes: ['circle'],
          gravity: 1.5,
          scalar: 0.8
        });
      }

      // Confirm update with real data
      queryClient.invalidateQueries({ queryKey: ['goals'] });

      return { success: true, newAmount: new_amount, isCompleted: is_completed };
    } catch (error: any) {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      toast.error('Failed to add funds', {
        description: error.message
      });

      return { success: false, error };
    }
  };

  return { contribute };
};
