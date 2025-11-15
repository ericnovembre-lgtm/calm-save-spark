import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Star } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CelebrationEffectProps {
  trigger: 'score_increase' | 'debt_paid' | 'goal_reached' | 'all_healthy';
  score?: number;
  message?: string;
}

export const CelebrationEffect = ({ trigger, score, message }: CelebrationEffectProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => setIsVisible(false), 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  useEffect(() => {
    if (showConfetti && !prefersReducedMotion) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const colors = ['#10b981', '#3b82f6', '#eab308', '#f59e0b'];

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setShowConfetti(false);
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount: Math.floor(particleCount),
          spread: 70,
          origin: { y: 0.6 },
          colors,
          gravity: 1.2,
          ticks: 200,
        });

        // Multiple bursts from different positions
        confetti({
          particleCount: Math.floor(particleCount / 2),
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });

        confetti({
          particleCount: Math.floor(particleCount / 2),
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti, prefersReducedMotion]);

  const getIcon = () => {
    switch (trigger) {
      case 'score_increase':
        return <TrendingUp className="w-12 h-12" />;
      case 'debt_paid':
        return <Trophy className="w-12 h-12" />;
      case 'goal_reached':
        return <Star className="w-12 h-12" />;
      case 'all_healthy':
        return <Sparkles className="w-12 h-12" />;
      default:
        return <Sparkles className="w-12 h-12" />;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (trigger) {
      case 'score_increase':
        return score ? `Your score jumped to ${score}! 🎉` : 'Great progress!';
      case 'debt_paid':
        return 'Debt paid off! Amazing work! 💪';
      case 'goal_reached':
        return 'Goal achieved! Keep it up! ⭐';
      case 'all_healthy':
        return 'All metrics healthy! Outstanding! 🌟';
      default:
        return 'Celebration!';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Flash effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Main celebration card */}
          <motion.div
            className="relative bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-primary p-8 max-w-md mx-4 pointer-events-auto"
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: -180, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            {/* Animated icon */}
            <motion.div
              className="flex justify-center mb-4 text-primary"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {getIcon()}
            </motion.div>

            {/* Message */}
            <motion.h2
              className="text-2xl font-bold text-center text-foreground mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getMessage()}
            </motion.h2>

            <motion.p
              className="text-center text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You're making fantastic financial progress!
            </motion.p>

            {/* Sparkles animation */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    style={{
                      left: `${20 + (i * 10)}%`,
                      top: `${30 + (i % 2 * 40)}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
