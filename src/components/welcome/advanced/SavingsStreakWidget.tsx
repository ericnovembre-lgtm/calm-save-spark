import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MorphingNumber } from './MorphingNumber';

/**
 * Savings Streak Widget
 * Gamified streak counter with growing flame and achievement badges
 */
export const SavingsStreakWidget = () => {
  const prefersReducedMotion = useReducedMotion();
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(35);

  // Simulate streak growth (in real app, fetch from backend)
  useEffect(() => {
    const storedStreak = localStorage.getItem('savingsStreak');
    if (storedStreak) {
      setStreak(parseInt(storedStreak));
    }
  }, []);

  const getFlameSize = () => {
    if (streak < 3) return 'w-12 h-12';
    if (streak < 7) return 'w-16 h-16';
    if (streak < 14) return 'w-20 h-20';
    if (streak < 30) return 'w-24 h-24';
    return 'w-32 h-32';
  };

  const getFlameColor = () => {
    if (streak < 7) return 'text-orange-400';
    if (streak < 14) return 'text-orange-500';
    if (streak < 30) return 'text-red-500';
    return 'text-red-600';
  };

  const getBadges = () => {
    const badges = [];
    if (streak >= 7) badges.push({ icon: '🔥', label: 'Week Warrior', color: 'bg-orange-500/20' });
    if (streak >= 14) badges.push({ icon: '⚡', label: 'Fortnight Force', color: 'bg-yellow-500/20' });
    if (streak >= 30) badges.push({ icon: '💎', label: 'Monthly Master', color: 'bg-blue-500/20' });
    if (streak >= 90) badges.push({ icon: '👑', label: 'Quarterly King', color: 'bg-purple-500/20' });
    return badges;
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, hsl(var(--accent)) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, hsl(var(--accent)) 0%, transparent 80%)',
            'radial-gradient(circle at 50% 50%, hsl(var(--accent)) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              Savings Streak
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep the momentum going!
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Level {level}
            </span>
          </div>
        </div>

        {/* Flame Icon */}
        <div className="flex justify-center my-8">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${getFlameSize()} transition-all duration-500`}
          >
            <Flame className={`w-full h-full ${getFlameColor()} drop-shadow-lg`} />
          </motion.div>
        </div>

        {/* Streak Counter */}
        <div className="text-center mb-6">
          <MorphingNumber 
            value={streak}
            suffix=" days"
            className="text-4xl font-bold text-foreground"
            duration={1}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Current streak
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Progress to next level
            </span>
            <span className="text-xs font-semibold text-accent">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Achievement Badges */}
        {getBadges().length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Target className="w-3 h-3" />
              <span>Achievements Unlocked</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getBadges().map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={`px-3 py-1.5 rounded-full ${badge.color} border border-accent/30 flex items-center gap-2`}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs font-semibold text-foreground">
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
