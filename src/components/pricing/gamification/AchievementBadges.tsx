import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Crown, Zap } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import confetti from 'canvas-confetti';
import { getTierForAmount } from '@/components/pricing/TierBadge';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

interface AchievementBadgesProps {
  selectedAmount: number;
}

export function AchievementBadges({ selectedAmount }: AchievementBadgesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge | null>(null);
  const tier = getTierForAmount(selectedAmount);

  const badges: Badge[] = [
    {
      id: 'starter',
      name: 'First Steps',
      description: 'Selected Starter tier',
      icon: Star,
      rarity: 'common',
      unlocked: selectedAmount >= 0,
    },
    {
      id: 'enhanced',
      name: 'Enhanced Saver',
      description: 'Reached Enhanced tier',
      icon: Zap,
      rarity: 'rare',
      unlocked: selectedAmount >= 4,
    },
    {
      id: 'premium',
      name: 'Premium Member',
      description: 'Unlocked Premium features',
      icon: Award,
      rarity: 'epic',
      unlocked: selectedAmount >= 8,
    },
    {
      id: 'advanced',
      name: 'Advanced Investor',
      description: 'Achieved Advanced status',
      icon: Trophy,
      rarity: 'epic',
      unlocked: selectedAmount >= 13,
    },
    {
      id: 'enterprise',
      name: 'Elite Saver',
      description: 'Reached Elite tier',
      icon: Crown,
      rarity: 'legendary',
      unlocked: selectedAmount >= 17,
    },
  ];

  useEffect(() => {
    const newUnlock = badges.find(b => b.unlocked && !prefersReducedMotion);
    if (newUnlock && newUnlock.id !== newlyUnlocked?.id) {
      setNewlyUnlocked(newUnlock);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setNewlyUnlocked(null), 3000);
    }
  }, [selectedAmount, prefersReducedMotion]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-amber-400 to-amber-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };

  return (
    <div className="space-y-6">
      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <div
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-br ' + rarityColors[badge.rarity] + ' border-transparent shadow-lg'
                  : 'bg-muted/50 border-border grayscale opacity-50'
              }`}
            >
              <badge.icon className={`w-12 h-12 mx-auto ${badge.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
              
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold ${badge.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                  {badge.name}
                </p>
                <p className={`text-xs mt-1 ${badge.unlocked ? 'text-white/80' : 'text-muted-foreground/60'}`}>
                  {badge.description}
                </p>
              </div>

              {badge.unlocked && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <Star className="w-3 h-3 text-primary-foreground fill-current" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unlock Notification */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-2xl min-w-80">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="inline-block"
                >
                  <newlyUnlocked.icon className="w-16 h-16 text-primary mx-auto mb-3" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-1">Badge Unlocked!</h3>
                <p className="text-lg font-semibold text-primary">{newlyUnlocked.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{newlyUnlocked.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
