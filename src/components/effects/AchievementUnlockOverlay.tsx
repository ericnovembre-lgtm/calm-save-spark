import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Star } from 'lucide-react';
import { useCelebration } from '@/contexts/CelebrationContext';
import { NeutralConfetti } from './NeutralConfetti';
import { Button } from '@/components/ui/button';

const rarityStars: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const rarityGradients: Record<string, string> = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-violet-400 to-purple-600',
  legendary: 'from-amber-400 via-yellow-500 to-orange-500',
};

export function AchievementUnlockOverlay() {
  const { isActive, celebration, dismissCelebration } = useCelebration();
  const [showConfetti, setShowConfetti] = useState(false);
  const [pointsDisplayed, setPointsDisplayed] = useState(0);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (isActive && celebration) {
      setShowConfetti(true);
      
      // Animate points counter
      if (celebration.points) {
        const duration = 1500;
        const steps = 30;
        const increment = celebration.points / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= celebration.points!) {
            setPointsDisplayed(celebration.points!);
            clearInterval(interval);
          } else {
            setPointsDisplayed(Math.floor(current));
          }
        }, duration / steps);
        return () => clearInterval(interval);
      }

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
      setPointsDisplayed(0);
    }
  }, [isActive, celebration, dismissCelebration]);

  const rarity = celebration?.rarity || 'common';
  const stars = rarityStars[rarity];
  const gradient = rarityGradients[rarity];

  return (
    <>
      <NeutralConfetti 
        show={showConfetti} 
        duration={celebration?.type === 'milestone' ? 4000 : 3000}
        count={rarity === 'legendary' ? 60 : rarity === 'epic' ? 45 : 30}
      />
      
      <AnimatePresence>
        {isActive && celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            onClick={dismissCelebration}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Card */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, rotateY: 180, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { scale: 1, rotateY: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 15, 
                stiffness: 100,
                duration: 0.6 
              }}
              className="relative w-full max-w-sm bg-background/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${celebration.color || 'hsl(var(--primary))'}, transparent 70%)`,
                }}
              />

              {/* Close button */}
              <button
                onClick={dismissCelebration}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-foreground/70" />
              </button>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon with glow */}
                <motion.div
                  initial={reduceMotion ? {} : { scale: 0, rotate: -180 }}
                  animate={reduceMotion ? {} : { scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-50"
                    style={{ backgroundColor: celebration.color || 'hsl(var(--primary))' }}
                  />
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-4xl">{celebration.icon}</span>
                  </div>
                </motion.div>

                {/* Rarity stars */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-1 mb-4"
                >
                  {Array.from({ length: stars }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={reduceMotion ? {} : { scale: 0, rotate: -180 }}
                      animate={reduceMotion ? {} : { scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                    >
                      <Star 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-2xl font-bold text-foreground mb-2"
                >
                  {celebration.title}
                </motion.h2>

                {/* Description */}
                {celebration.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-foreground/70 mb-4"
                  >
                    {celebration.description}
                  </motion.p>
                )}

                {/* Points */}
                {celebration.points && celebration.points > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-semibold mb-6"
                  >
                    <span className="text-lg">+{pointsDisplayed}</span>
                    <span className="text-sm opacity-80">points</span>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 justify-center"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissCelebration}
                    className="rounded-full"
                  >
                    Continue
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: celebration.title,
                          text: celebration.description,
                        });
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
