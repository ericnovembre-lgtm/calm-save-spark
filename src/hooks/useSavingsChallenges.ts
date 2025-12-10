import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavingsChallenge {
  id: string;
  user_id: string;
  challenge_name: string;
  challenge_type: 'no_spend' | 'save_amount' | 'reduce_category' | 'custom' | '52_week' | 'round_up';
  target_amount: number | null;
  current_amount: number;
  start_date: string;
  end_date: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string | null;
  streak_count: number;
  best_streak: number;
  is_completed: boolean;
  is_active: boolean;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeMilestone {
  id: string;
  challenge_id: string;
  user_id: string;
  milestone_name: string;
  target_percentage: number;
  reached_at: string | null;
  bonus_points: number;
  created_at: string;
}

export interface CreateChallengeInput {
  challenge_name: string;
  challenge_type: SavingsChallenge['challenge_type'];
  target_amount?: number;
  start_date: string;
  end_date: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  category?: string;
  icon?: string;
  color?: string;
}

export function useSavingsChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading, error } = useQuery({
    queryKey: ['savings_challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('savings_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsChallenge[];
    },
    enabled: !!user,
  });

  const createChallenge = useMutation({
    mutationFn: async (input: CreateChallengeInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('savings_challenges')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Create default milestones
      const milestones = [
        { challenge_id: data.id, user_id: user.id, milestone_name: '25% Complete', target_percentage: 25, bonus_points: 25 },
        { challenge_id: data.id, user_id: user.id, milestone_name: '50% Complete', target_percentage: 50, bonus_points: 50 },
        { challenge_id: data.id, user_id: user.id, milestone_name: '75% Complete', target_percentage: 75, bonus_points: 75 },
        { challenge_id: data.id, user_id: user.id, milestone_name: 'Challenge Complete!', target_percentage: 100, bonus_points: 100 },
      ];

      await supabase.from('challenge_milestones').insert(milestones);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_challenges'] });
      toast.success('Challenge created!');
    },
    onError: (error) => {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ challengeId, amount }: { challengeId: string; amount: number }) => {
      if (!user) throw new Error('Not authenticated');

      const challenge = challenges?.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const newAmount = challenge.current_amount + amount;
      const isCompleted = challenge.target_amount ? newAmount >= challenge.target_amount : false;

      const { data, error } = await supabase
        .from('savings_challenges')
        .update({
          current_amount: newAmount,
          is_completed: isCompleted,
          streak_count: challenge.streak_count + 1,
          best_streak: Math.max(challenge.best_streak, challenge.streak_count + 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      // Check and update milestones
      if (challenge.target_amount) {
        const progress = (newAmount / challenge.target_amount) * 100;
        const { data: milestones } = await supabase
          .from('challenge_milestones')
          .select('*')
          .eq('challenge_id', challengeId)
          .is('reached_at', null)
          .lte('target_percentage', progress);

        if (milestones && milestones.length > 0) {
          await supabase
            .from('challenge_milestones')
            .update({ reached_at: new Date().toISOString() })
            .in('id', milestones.map(m => m.id));
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_challenges'] });
      toast.success('Progress updated!');
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    },
  });

  const deleteChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('savings_challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_challenges'] });
      toast.success('Challenge deleted');
    },
    onError: (error) => {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    },
  });

  const activeChallenges = challenges?.filter(c => c.is_active && !c.is_completed) || [];
  const completedChallenges = challenges?.filter(c => c.is_completed) || [];

  return {
    challenges: challenges || [],
    activeChallenges,
    completedChallenges,
    isLoading,
    error,
    createChallenge: createChallenge.mutate,
    isCreating: createChallenge.isPending,
    updateProgress: updateProgress.mutate,
    isUpdating: updateProgress.isPending,
    deleteChallenge: deleteChallenge.mutate,
    isDeleting: deleteChallenge.isPending,
  };
}

export function useChallengeMilestones(challengeId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenge_milestones', challengeId],
    queryFn: async () => {
      if (!user || !challengeId) return [];

      const { data, error } = await supabase
        .from('challenge_milestones')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('target_percentage', { ascending: true });

      if (error) throw error;
      return data as ChallengeMilestone[];
    },
    enabled: !!user && !!challengeId,
  });
}
