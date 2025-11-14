import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InteractiveCard } from '@/components/ui/interactive-card';
import { SectionHeader } from './SectionHeader';
import { TrendingUp, Target, Flame, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ANIMATION_VARIANTS, ANIMATION_DURATION, STAGGER_DELAY } from '@/lib/animation-constants';

interface PersonalImpactCardProps {
  userId: string;
}

/**
 * Personal Impact Summary Card
 * Shows encouraging metrics about savings progress
 */
export function PersonalImpactCard({ userId }: PersonalImpactCardProps) {
  const prefersReducedMotion = useReducedMotion();

  // Fetch user's savings data
  const { data: pots } = useQuery({
    queryKey: ['pots-impact', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch profile for streak data
  const { data: profile } = useQuery({
    queryKey: ['profile-impact', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, last_activity_date')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const totalSaved = pots?.reduce((sum, pot) => sum + (pot.current_amount || 0), 0) || 0;
  const totalGoals = pots?.length || 0;
  const goalsInProgress = pots?.filter(pot => 
    (pot.current_amount || 0) > 0 && (pot.current_amount || 0) < pot.target_amount
  ).length || 0;
  const currentStreak = profile?.current_streak || 0;

  // Calculate average progress rate
  const avgProgress = pots && pots.length > 0
    ? pots.reduce((sum, pot) => sum + ((pot.current_amount || 0) / pot.target_amount * 100), 0) / pots.length
    : 0;

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Saved',
      value: `$${totalSaved.toFixed(0)}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Target,
      label: 'Active Goals',
      value: `${goalsInProgress}/${totalGoals}`,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: 'Avg Progress',
      value: `${avgProgress.toFixed(0)}%`,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${currentStreak} days`,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  // Generate encouraging message
  const getMessage = () => {
    if (totalSaved >= 10000) return "You're crushing it! 🎉";
    if (totalSaved >= 5000) return "Amazing progress! Keep going! 🚀";
    if (totalSaved >= 1000) return "Great job! You're building momentum! 💪";
    if (currentStreak >= 7) return `${currentStreak} day streak! You're on fire! 🔥`;
    if (goalsInProgress > 0) return "You're making great progress! 🌟";
    return "Let's start your savings journey! ✨";
  };

  return (
    <InteractiveCard className="overflow-hidden">
      <SectionHeader
        icon={TrendingUp}
        title="Your Impact This Month"
        description={getMessage()}
        tooltip="Track your savings progress and celebrate your achievements"
      />

      <motion.div
        variants={prefersReducedMotion ? undefined : ANIMATION_VARIANTS.staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              variants={prefersReducedMotion ? undefined : ANIMATION_VARIANTS.fadeIn}
              transition={{
                duration: ANIMATION_DURATION.normal / 1000,
                delay: index * (STAGGER_DELAY.grid / 1000),
              }}
              className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-lg ${metric.bg} mb-2`}>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric.label}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </InteractiveCard>
  );
}