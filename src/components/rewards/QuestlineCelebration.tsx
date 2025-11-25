import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { NeutralConfetti } from '../effects/NeutralConfetti';
import { ParticleEffect } from '../effects/ParticleEffect';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface QuestlineCelebrationProps {
  isVisible: boolean;
  stepTitle: string;
  stepPoints: number;
  questlineName: string;
  category: string;
  isQuestlineComplete: boolean;
  onDismiss?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'debt_slay': return { primary: '#fb7185', gradient: 'from-rose-500 to-red-600' };
    case 'home_horizon': return { primary: '#22d3ee', gradient: 'from-cyan-500 to-blue-600' };
    case 'savings_sprint': return { primary: '#34d399', gradient: 'from-emerald-500 to-green-600' };
    case 'credit_builder': return { primary: '#f472b6', gradient: 'from-pink-500 to-purple-600' };
    default: return { primary: 'hsl(var(--primary))', gradient: 'from-primary to-accent' };
  }
};

/**
 * Full-screen celebration overlay for questline milestones
 * Shows confetti, particles, and achievement notification
 */
export function QuestlineCelebration({
  isVisible,
  stepTitle,
  stepPoints,
  questlineName,
  category,
  isQuestlineComplete,
  onDismiss,
}: QuestlineCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getCategoryColor(category);

  // Trigger canvas confetti when visible
  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const duration = isQuestlineComplete ? 4000 : 2500;
    const particleCount = isQuestlineComplete ? 150 : 60;
    
    // Multi-burst confetti
    const burstCount = isQuestlineComplete ? 3 : 2;
    
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        confetti({
          particleCount: particleCount / burstCount,
          spread: 70,
          origin: { y: 0.6 },
          colors: [colors.primary, '#fbbf24', '#f59e0b'],
          ticks: 200,
        });
      }, i * 300);
    }
  }, [isVisible, isQuestlineComplete, colors.primary, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* NeutralConfetti overlay */}
          <NeutralConfetti
            show={isVisible}
            duration={isQuestlineComplete ? 4000 : 2500}
            count={isQuestlineComplete ? 50 : 30}
          />

          {/* Celebration notification card */}
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="pointer-events-auto relative max-w-md mx-4"
              initial={prefersReducedMotion ? {} : { scale: 0.8, y: 50 }}
              animate={prefersReducedMotion ? {} : { scale: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { scale: 0.8, y: 50 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onClick={onDismiss}
            >
              <div className={`relative bg-gradient-to-br ${colors.gradient} p-8 rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden`}>
                {/* Particle effect layer */}
                <ParticleEffect
                  trigger={isVisible}
                  color={colors.primary}
                  particleCount={isQuestlineComplete ? 40 : 25}
                  duration={2500}
                />

                {/* Shimmer effect */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}

                <div className="relative space-y-4 text-center text-white">
                  {/* Icon */}
                  <motion.div
                    className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    animate={prefersReducedMotion ? {} : {
                      scale: [1, 1.1, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {isQuestlineComplete ? (
                      <Trophy className="w-8 h-8" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8" />
                    )}
                  </motion.div>

                  {/* Title */}
                  <div>
                    <motion.h2
                      className="text-2xl font-bold mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isQuestlineComplete ? '🎊 Questline Complete!' : '📖 Chapter Complete!'}
                    </motion.h2>
                    <motion.p
                      className="text-lg opacity-90"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {stepTitle}
                    </motion.p>
                  </div>

                  {/* Quest name */}
                  <motion.div
                    className="text-sm opacity-80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {questlineName}
                  </motion.div>

                  {/* Points earned */}
                  <motion.div
                    className="flex items-center justify-center gap-2 text-xl font-bold bg-white/20 rounded-full px-6 py-2 backdrop-blur-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.5,
                      type: 'spring',
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>+{stepPoints} Points</span>
                  </motion.div>

                  {/* Tap to dismiss hint */}
                  <motion.p
                    className="text-xs opacity-60 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Tap to continue
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
