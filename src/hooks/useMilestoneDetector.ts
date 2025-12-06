import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useCelebrationTrigger } from './useCelebrationTrigger';

export type Milestone = {
  amount: number;
  label: string;
  confettiType: 'bronze' | 'silver' | 'gold' | 'diamond' | 'rainbow';
  message: string;
};

const MILESTONES: Milestone[] = [
  { amount: 1000, label: 'First Grand', confettiType: 'bronze', message: 'You saved your first $1,000!' },
  { amount: 5000, label: 'Halfway Hero', confettiType: 'silver', message: "You're halfway to $10K!" },
  { amount: 10000, label: 'Five Figures', confettiType: 'gold', message: "You've reached $10,000!" },
  { amount: 50000, label: 'Saving Star', confettiType: 'diamond', message: "You're a saving star at $50K!" },
  { amount: 100000, label: 'Six Figures', confettiType: 'rainbow', message: 'Incredible! Six figures achieved!' },
];

// Map confetti types to celebration tier names
const confettiToTier: Record<string, 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  diamond: 'diamond',
  rainbow: 'diamond', // Rainbow maps to diamond (highest tier)
};

export function useMilestoneDetector(currentBalance: number) {
  const [triggeredMilestone, setTriggeredMilestone] = useState<Milestone | null>(null);
  const previousBalance = useRef<number>(currentBalance);
  const checkedMilestones = useRef<Set<number>>(new Set());
  const { triggerMilestoneCelebration } = useCelebrationTrigger();

  // Fetch user's milestone history
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-milestones', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('milestones_reached')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    // Load previously reached milestones
    if (profile?.milestones_reached) {
      const reached = Object.keys(profile.milestones_reached).map(Number);
      reached.forEach(amount => checkedMilestones.current.add(amount));
    }
  }, [profile]);

  useEffect(() => {
    // Check if we crossed a milestone
    const prev = previousBalance.current;
    
    for (const milestone of MILESTONES) {
      const alreadyReached = checkedMilestones.current.has(milestone.amount);
      const justCrossed = prev < milestone.amount && currentBalance >= milestone.amount;
      
      if (justCrossed && !alreadyReached) {
        setTriggeredMilestone(milestone);
        checkedMilestones.current.add(milestone.amount);
        
        // Trigger global celebration overlay
        triggerMilestoneCelebration({
          amount: milestone.amount,
          name: milestone.label,
          tier: confettiToTier[milestone.confettiType] || 'gold',
        });
        
        // Save to database
        if (session?.user?.id) {
          const milestonesReached = (profile?.milestones_reached || {}) as Record<string, string>;
          const updatedMilestones = {
            ...milestonesReached,
            [milestone.amount]: new Date().toISOString()
          };
          
          supabase
            .from('profiles')
            .update({ milestones_reached: updatedMilestones })
            .eq('id', session.user.id)
            .then();
        }
        
        break; // Only trigger one at a time
      }
    }

    previousBalance.current = currentBalance;
  }, [currentBalance, session?.user?.id, profile?.milestones_reached, triggerMilestoneCelebration]);

  const dismissMilestone = () => setTriggeredMilestone(null);

  return {
    milestone: triggeredMilestone,
    dismissMilestone
  };
}
