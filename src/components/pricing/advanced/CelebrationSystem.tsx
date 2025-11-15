import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePricingSounds } from '@/hooks/usePricingSounds';
import { Check, Sparkles, Trophy } from 'lucide-react';

interface CelebrationSystemProps {
  show: boolean;
  type?: 'tier-unlock' | 'checkout' | 'success';
  onComplete?: () => void;
}

export default function CelebrationSystem({
  show,
  type = 'success',
  onComplete,
}: CelebrationSystemProps) {
  const prefersReducedMotion = useReducedMotion();
  const { playSuccessSound } = usePricingSounds();

  useEffect(() => {
    if (!show || prefersReducedMotion) return;

    // Play success sound
    playSuccessSound();

    // Multi-stage confetti
    const fireConfetti = () => {
      const count = type === 'success' ? 200 : type === 'checkout' ? 150 : 100;
      const spread = type === 'success' ? 180 : type === 'checkout' ? 120 : 90;

      // Custom shapes for different types
      const shapes: confetti.Shape[] = type === 'success' 
        ? ['circle', 'square', 'star'] 
        : ['circle', 'square'];

      confetti({
        particleCount: count,
        spread: spread,
        origin: { y: 0.6 },
        colors: ['#d6c8a2', '#faf8f2', '#0a0a0a'],
        shapes: shapes,
        scalar: 1.2,
        gravity: 0.8,
        drift: 0.1,
      });

      // Second burst for success
      if (type === 'success') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#d6c8a2', '#faf8f2'],
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#d6c8a2', '#faf8f2'],
          });
        }, 250);
      }
    };

    fireConfetti();

    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, type, prefersReducedMotion, playSuccessSound, onComplete]);

  if (!show) return null;

  const icons = {
    'tier-unlock': Sparkles,
    'checkout': Trophy,
    'success': Check,
  };

  const Icon = icons[type];
  const messages = {
    'tier-unlock': 'Tier Unlocked!',
    'checkout': 'Almost There!',
    'success': 'Welcome Aboard!',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-background/95 backdrop-blur-xl border-2 border-primary rounded-2xl p-8 shadow-2xl pointer-events-auto"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              boxShadow: [
                '0 0 0 0 rgba(214, 200, 162, 0)',
                '0 0 0 20px rgba(214, 200, 162, 0.2)',
                '0 0 0 40px rgba(214, 200, 162, 0)',
              ]
            }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 20,
              boxShadow: { duration: 1.5, repeat: Infinity }
            }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="relative"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Icon className="w-16 h-16 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl opacity-50"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <motion.h2
                className="text-3xl font-bold text-primary"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                {messages[type]}
              </motion.h2>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
