import { useCallback } from 'react';
import { useCelebration, CelebrationData, CelebrationType } from '@/contexts/CelebrationContext';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface Achievement {
  id: string;
  name: string;
  description?: string;
  points?: number;
  icon?: string;
  badge_color?: string;
}

interface Milestone {
  amount: number;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface Challenge {
  id: string;
  title: string;
  reward_points?: number;
}

export function useCelebrationTrigger() {
  const { triggerCelebration } = useCelebration();
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();

  const triggerAchievementCelebration = useCallback((achievement: Achievement) => {
    const rarity = achievement.points && achievement.points >= 500 ? 'legendary' 
      : achievement.points && achievement.points >= 200 ? 'epic'
      : achievement.points && achievement.points >= 100 ? 'rare' 
      : 'common';

    const data: CelebrationData = {
      type: 'achievement',
      title: achievement.name,
      description: achievement.description,
      points: achievement.points,
      icon: achievement.icon || '🏆',
      rarity,
      color: achievement.badge_color || 'hsl(var(--accent))',
    };

    playSuccessChime();
    setTimeout(() => playConfettiPop(), 200);
    triggerHaptic('success');
    triggerCelebration(data);
  }, [triggerCelebration, playSuccessChime, playConfettiPop, triggerHaptic]);

  const triggerMilestoneCelebration = useCallback((milestone: Milestone) => {
    const tierColors: Record<string, string> = {
      bronze: 'hsl(30, 60%, 50%)',
      silver: 'hsl(0, 0%, 70%)',
      gold: 'hsl(45, 100%, 50%)',
      platinum: 'hsl(200, 20%, 80%)',
      diamond: 'hsl(200, 100%, 70%)',
    };

    const data: CelebrationData = {
      type: 'milestone',
      title: milestone.name,
      description: `You've saved $${milestone.amount.toLocaleString()}!`,
      icon: milestone.tier === 'diamond' ? '💎' : milestone.tier === 'gold' ? '🥇' : '🎯',
      rarity: milestone.tier === 'diamond' ? 'legendary' : milestone.tier === 'gold' ? 'epic' : 'rare',
      color: tierColors[milestone.tier],
    };

    playSuccessChime();
    setTimeout(() => playConfettiPop(), 200);
    triggerHaptic('success');
    triggerCelebration(data);
  }, [triggerCelebration, playSuccessChime, playConfettiPop, triggerHaptic]);

  const triggerChallengeWinCelebration = useCallback((challenge: Challenge) => {
    const data: CelebrationData = {
      type: 'challenge',
      title: 'Challenge Complete!',
      description: challenge.title,
      points: challenge.reward_points,
      icon: '🏅',
      rarity: 'epic',
      color: 'hsl(var(--primary))',
    };

    playSuccessChime();
    setTimeout(() => playConfettiPop(), 200);
    triggerHaptic('success');
    triggerCelebration(data);
  }, [triggerCelebration, playSuccessChime, playConfettiPop, triggerHaptic]);

  const triggerStreakCelebration = useCallback((days: number) => {
    const data: CelebrationData = {
      type: 'streak',
      title: `${days} Day Streak!`,
      description: 'Keep up the amazing consistency!',
      icon: '🔥',
      rarity: days >= 30 ? 'legendary' : days >= 14 ? 'epic' : days >= 7 ? 'rare' : 'common',
      color: 'hsl(25, 100%, 50%)',
    };

    playSuccessChime();
    triggerHaptic('medium');
    triggerCelebration(data);
  }, [triggerCelebration, playSuccessChime, triggerHaptic]);

  const triggerRankUpCelebration = useCallback((newRank: string, tier: string) => {
    const tierColors: Record<string, string> = {
      bronze: 'hsl(30, 60%, 50%)',
      silver: 'hsl(0, 0%, 70%)',
      gold: 'hsl(45, 100%, 50%)',
      platinum: 'hsl(200, 20%, 80%)',
      diamond: 'hsl(200, 100%, 70%)',
    };

    const data: CelebrationData = {
      type: 'rank_up',
      title: 'Rank Up!',
      description: `You've reached ${newRank}!`,
      icon: tier === 'diamond' ? '💎' : tier === 'platinum' ? '🏆' : tier === 'gold' ? '🥇' : '⭐',
      rarity: tier === 'diamond' ? 'legendary' : tier === 'platinum' ? 'epic' : 'rare',
      color: tierColors[tier] || 'hsl(var(--primary))',
    };

    playSuccessChime();
    setTimeout(() => playConfettiPop(), 200);
    triggerHaptic('success');
    triggerCelebration(data);
  }, [triggerCelebration, playSuccessChime, playConfettiPop, triggerHaptic]);

  return {
    triggerAchievementCelebration,
    triggerMilestoneCelebration,
    triggerChallengeWinCelebration,
    triggerStreakCelebration,
    triggerRankUpCelebration,
  };
}
