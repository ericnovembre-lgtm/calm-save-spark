import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Trophy, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationProps {
  type: 'success' | 'achievement' | 'goal' | 'milestone';
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}

/**
 * Lottie-style Celebrations
 * Lightweight animated celebrations using SVG/CSS instead of heavy GIFs
 */
export function LottieCelebrations({ type, isVisible, onComplete, message }: CelebrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible && !prefersReducedMotion) {
      setShowContent(true);

      // Trigger confetti for achievements and goals
      if (type === 'achievement' || type === 'goal' || type === 'milestone') {
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#22c55e', '#3b82f6', '#f59e0b'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#22c55e', '#3b82f6', '#f59e0b'],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }

      // Auto-dismiss after animation
      const timer = setTimeout(() => {
        setShowContent(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, type, prefersReducedMotion, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'achievement':
        return Star;
      case 'goal':
        return Trophy;
      case 'milestone':
        return Sparkles;
      default:
        return CheckCircle2;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          primary: 'text-success',
          bg: 'bg-success/10',
          ring: 'ring-success/30',
        };
      case 'achievement':
        return {
          primary: 'text-amber-500',
          bg: 'bg-amber-500/10',
          ring: 'ring-amber-500/30',
        };
      case 'goal':
        return {
          primary: 'text-primary',
          bg: 'bg-primary/10',
          ring: 'ring-primary/30',
        };
      case 'milestone':
        return {
          primary: 'text-accent',
          bg: 'bg-accent/10',
          ring: 'ring-accent/30',
        };
      default:
        return {
          primary: 'text-success',
          bg: 'bg-success/10',
          ring: 'ring-success/30',
        };
    }
  };

  const Icon = getIcon();
  const colors = getColors();

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Animated rings */}
          <div className="relative">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: 1,
                  ease: 'easeOut',
                }}
                className={cn(
                  'absolute inset-0 rounded-full ring-4',
                  colors.ring
                )}
                style={{
                  width: 120,
                  height: 120,
                  left: -60,
                  top: -60,
                }}
              />
            ))}

            {/* Main icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 200,
              }}
              className={cn(
                'relative z-10 p-6 rounded-full',
                colors.bg
              )}
            >
              <Icon className={cn('w-16 h-16', colors.primary)} />
            </motion.div>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute mt-40 text-center"
            >
              <p className="text-lg font-semibold text-foreground">{message}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline success checkmark animation
 */
export function SuccessCheckmark({ isVisible }: { isVisible: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 15 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-success"
          >
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M8 12l2.5 2.5L16 9"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Pulsing indicator for live/active states
 */
export function PulsingIndicator({ color = 'success' }: { color?: 'success' | 'warning' | 'destructive' | 'primary' }) {
  const colorClasses = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    primary: 'bg-primary',
  };

  return (
    <span className="relative flex h-2 w-2">
      <span className={cn(
        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
        colorClasses[color]
      )} />
      <span className={cn(
        'relative inline-flex rounded-full h-2 w-2',
        colorClasses[color]
      )} />
    </span>
  );
}
