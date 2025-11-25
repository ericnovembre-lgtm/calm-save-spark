import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumEnvelope } from './PremiumEnvelope';
import { PhysicalCreditCard } from './PhysicalCreditCard';
import { CardParticleEffects } from './CardParticleEffects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { haptics } from '@/lib/haptics';

type UnboxingPhase = 
  | 'idle'
  | 'envelope-enter'
  | 'shake'
  | 'seal-break'
  | 'flap-open'
  | 'card-emerge'
  | 'envelope-exit'
  | 'glamour-spin'
  | 'celebration'
  | 'complete';

// Custom haptic patterns for unboxing experience
const UNBOXING_HAPTICS = {
  shake: [10, 30, 10, 30, 10],
  sealBreak: [30, 50, 20],
  flapOpen: [15, 100, 10],
  cardEmerge: [20, 40, 30, 60, 40],
  glamourSpin: [15, 200, 15, 200, 15],
};

interface CardUnboxingExperienceProps {
  variant: 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  onComplete: () => void;
  autoPlay?: boolean;
}

export function CardUnboxingExperience({
  variant,
  cardHolder,
  cardNumber,
  expiryDate,
  onComplete,
  autoPlay = true,
}: CardUnboxingExperienceProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<UnboxingPhase>('idle');
  const [particleTrigger, setParticleTrigger] = useState<'seal-break' | 'celebration' | null>(null);
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();

  useEffect(() => {
    if (!autoPlay) return;

    if (prefersReducedMotion) {
      // Skip animations, show card directly
      setPhase('complete');
      setTimeout(onComplete, 500);
      return;
    }

    // Animation timeline with haptics
    const timeline = [
      { delay: 0, phase: 'envelope-enter' as UnboxingPhase },
      { delay: 500, phase: 'shake' as UnboxingPhase, haptic: () => haptics.custom(UNBOXING_HAPTICS.shake) },
      { delay: 1100, phase: 'seal-break' as UnboxingPhase, sound: () => playConfettiPop(), haptic: () => haptics.custom(UNBOXING_HAPTICS.sealBreak) },
      { delay: 1500, phase: 'flap-open' as UnboxingPhase, haptic: () => haptics.custom(UNBOXING_HAPTICS.flapOpen) },
      { delay: 2300, phase: 'card-emerge' as UnboxingPhase, haptic: () => haptics.custom(UNBOXING_HAPTICS.cardEmerge) },
      { delay: 3100, phase: 'envelope-exit' as UnboxingPhase },
      { delay: 3500, phase: 'glamour-spin' as UnboxingPhase, haptic: () => haptics.custom(UNBOXING_HAPTICS.glamourSpin) },
      { delay: 4500, phase: 'celebration' as UnboxingPhase, sound: () => playSuccessChime(), haptic: () => haptics.pattern('achievement') },
      { delay: 7500, phase: 'complete' as UnboxingPhase },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    timeline.forEach(({ delay, phase, sound, haptic }: { 
      delay: number; 
      phase: UnboxingPhase; 
      sound?: () => void; 
      haptic?: () => void 
    }) => {
      const timeout = setTimeout(() => {
        setPhase(phase);
        sound?.();
        haptic?.();
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [autoPlay, prefersReducedMotion, onComplete, playSuccessChime, playConfettiPop]);

  // Trigger particle effects based on phase
  useEffect(() => {
    if (phase === 'seal-break') {
      setParticleTrigger('seal-break');
    } else if (phase === 'celebration') {
      setParticleTrigger('celebration');
    } else {
      setParticleTrigger(null);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'complete') {
      setTimeout(onComplete, 500);
    }
  }, [phase, onComplete]);

  if (prefersReducedMotion && phase === 'complete') {
    return null;
  }

  const envelopePhase = 
    phase === 'envelope-enter' || phase === 'shake' ? 'sealed' :
    phase === 'seal-break' ? 'breaking' :
    phase === 'flap-open' ? 'opening' :
    'open';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center overflow-hidden"
    >
      {/* Particle Effects */}
      <CardParticleEffects trigger={particleTrigger} />

      {/* Envelope */}
      <AnimatePresence mode="wait">
        {(phase !== 'envelope-exit' && phase !== 'glamour-spin' && phase !== 'celebration' && phase !== 'complete') && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              phase === 'shake'
                ? {
                    opacity: 1,
                    scale: 1,
                    x: [0, -5, 5, -3, 3, 0],
                    rotate: [0, -1, 1, -0.5, 0.5, 0],
                  }
                : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={
              phase === 'shake'
                ? {
                    x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
                    rotate: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
                  }
                : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative"
          >
            <PremiumEnvelope phase={envelopePhase} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <AnimatePresence mode="wait">
        {(phase === 'card-emerge' || phase === 'envelope-exit' || phase === 'glamour-spin' || phase === 'celebration' || phase === 'complete') && (
          <motion.div
            key="card"
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={
              phase === 'glamour-spin'
                ? {
                    y: 0,
                    opacity: 1,
                    scale: 1.1,
                    rotateY: [0, 180, 360],
                    z: 50,
                  }
                : phase === 'celebration' || phase === 'complete'
                ? {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    z: 0,
                  }
                : {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={
              phase === 'glamour-spin'
                ? {
                    type: 'spring',
                    damping: 20,
                    stiffness: 200,
                    rotateY: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                  }
                : {
                    type: 'spring',
                    damping: 25,
                    stiffness: 300,
                  }
            }
            className="relative"
          >
            <PhysicalCreditCard
              variant={variant}
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryDate={expiryDate}
              showDetails={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Text */}
      {phase === 'celebration' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
        >
          <motion.h2
            className="text-4xl font-bold text-white mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            Welcome to $ave+
          </motion.h2>
          <p className="text-white/80 text-lg">Your exclusive metal card is ready</p>
        </motion.div>
      )}
    </motion.div>
  );
}
