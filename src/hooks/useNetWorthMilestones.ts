import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export type MilestoneType = 'positive_net_worth' | 'round_number' | 'all_time_high' | 'debt_free' | 'savings_goal' | 'custom';

export interface NetWorthMilestone {
  id: string;
  user_id: string;
  milestone_type: MilestoneType;
  milestone_value: number;
  achieved_at: string;
  previous_value: number | null;
  celebration_shown: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const MILESTONE_LABELS: Record<MilestoneType, string> = {
  positive_net_worth: 'Positive Net Worth!',
  round_number: 'Milestone Reached',
  all_time_high: 'All-Time High!',
  debt_free: 'Debt Free!',
  savings_goal: 'Savings Goal Hit',
  custom: 'Milestone Achieved',
};

const MILESTONE_ICONS: Record<MilestoneType, string> = {
  positive_net_worth: '🎉',
  round_number: '🏆',
  all_time_high: '📈',
  debt_free: '🆓',
  savings_goal: '🎯',
  custom: '⭐',
};

export function useNetWorthMilestones() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: milestones, isLoading, error, refetch } = useQuery({
    queryKey: ['net-worth-milestones', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('net_worth_milestones')
        .select('*')
        .eq('user_id', session.user.id)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return data as NetWorthMilestone[];
    },
    enabled: !!session?.user?.id,
  });

  // Get uncelebrated milestones for celebration triggers
  const uncelebratedMilestones = milestones?.filter(m => !m.celebration_shown) ?? [];

  const markCelebrated = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('net_worth_milestones')
        .update({ celebration_shown: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-milestones'] });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: {
      milestone_type: MilestoneType;
      milestone_value: number;
      previous_value?: number;
      notes?: string;
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { data: milestone, error } = await supabase
        .from('net_worth_milestones')
        .insert({
          user_id: session.user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return milestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-milestones'] });
    },
  });

  // Subscribe to real-time milestone updates for celebration triggers
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('net-worth-milestones-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'net_worth_milestones',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, refetch]);

  const getMilestoneLabel = (type: MilestoneType) => MILESTONE_LABELS[type];
  const getMilestoneIcon = (type: MilestoneType) => MILESTONE_ICONS[type];

  // Check for milestone achievements based on current net worth
  const checkMilestones = async (currentNetWorth: number, previousNetWorth: number) => {
    if (!session?.user?.id) return;

    const milestonesToCreate: Array<{
      milestone_type: MilestoneType;
      milestone_value: number;
      previous_value: number;
      notes?: string;
    }> = [];

    // Check for positive net worth milestone
    if (previousNetWorth <= 0 && currentNetWorth > 0) {
      milestonesToCreate.push({
        milestone_type: 'positive_net_worth',
        milestone_value: currentNetWorth,
        previous_value: previousNetWorth,
        notes: 'Crossed into positive net worth!',
      });
    }

    // Check for round number milestones ($10k, $25k, $50k, $100k, $250k, $500k, $1M)
    const roundMilestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    for (const milestone of roundMilestones) {
      if (previousNetWorth < milestone && currentNetWorth >= milestone) {
        const alreadyAchieved = milestones?.some(
          m => m.milestone_type === 'round_number' && m.milestone_value === milestone
        );
        if (!alreadyAchieved) {
          milestonesToCreate.push({
            milestone_type: 'round_number',
            milestone_value: milestone,
            previous_value: previousNetWorth,
            notes: `Reached $${milestone.toLocaleString()}!`,
          });
        }
      }
    }

    // Check for all-time high
    const allTimeHigh = Math.max(...(milestones?.map(m => m.milestone_value) ?? [0]));
    if (currentNetWorth > allTimeHigh && currentNetWorth > previousNetWorth) {
      const recentHighMilestone = milestones?.find(
        m => m.milestone_type === 'all_time_high' && 
        new Date(m.achieved_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      if (!recentHighMilestone) {
        milestonesToCreate.push({
          milestone_type: 'all_time_high',
          milestone_value: currentNetWorth,
          previous_value: previousNetWorth,
          notes: 'New all-time high net worth!',
        });
      }
    }

    // Create all milestones
    for (const milestone of milestonesToCreate) {
      await createMilestone.mutateAsync(milestone);
    }
  };

  return {
    milestones: milestones ?? [],
    uncelebratedMilestones,
    isLoading,
    error,
    refetch,
    markCelebrated,
    createMilestone,
    checkMilestones,
    getMilestoneLabel,
    getMilestoneIcon,
  };
}
