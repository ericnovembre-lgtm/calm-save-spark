import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface DashboardWidgetCardProps {
  children: ReactNode;
  className?: string;
  secondaryContent?: ReactNode;
  lastUpdated?: string;
  onClick?: () => void;
  'data-tour'?: string;
}

/**
 * DashboardWidgetCard - "Sentient Bento Card" with dynamic borders, content reveal,
 * and micro-interactions (sound + haptics)
 * Features:
 * - Dynamic pulsing border on hover
 * - Secondary content slides up and fades in on hover
 * - Ultra-clean default state
 * - Subtle hover sounds and haptic feedback
 */
export function DashboardWidgetCard({
  children,
  className,
  secondaryContent,
  lastUpdated,
  onClick,
  'data-tour': dataTour,
}: DashboardWidgetCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const { playHoverSound, playClickSound, preferences: soundPrefs } = useSoundEffects();
  const { triggerHaptic } = useHapticFeedback();

  // Handle hover enter with sound + haptic
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (soundPrefs.enabled) {
      playHoverSound();
    }
    triggerHaptic('light');
  }, [playHoverSound, triggerHaptic, soundPrefs.enabled]);

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Handle click with enhanced feedback
  const handleClick = useCallback(() => {
    if (onClick) {
      if (soundPrefs.enabled) {
        playClickSound();
      }
      triggerHaptic('medium');
      onClick();
    }
  }, [onClick, playClickSound, triggerHaptic, soundPrefs.enabled]);

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-card/80 backdrop-blur-2xl',
        'border border-white/10',
        'shadow-[0_8px_32px_-8px_hsla(var(--primary),0.1)]',
        'transition-all duration-500',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        willChange: 'transform, box-shadow',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px -8px hsla(var(--primary), 0.08)',
      }}
      data-tour={dataTour}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={!prefersReducedMotion ? {
        y: -4,
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), 0 0 0 1px hsla(var(--primary), 0.25), 0 16px 48px -12px hsla(var(--primary), 0.2)',
      } : undefined}
      whileTap={onClick && !prefersReducedMotion ? { scale: 0.98 } : undefined}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Animated Pulsing Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'transparent',
        }}
        animate={isHovered && !prefersReducedMotion ? {
          boxShadow: [
            '0 0 0 1px hsla(var(--primary), 0.15), inset 0 0 40px hsla(var(--primary), 0.02)',
            '0 0 0 2px hsla(var(--primary), 0.35), inset 0 0 60px hsla(var(--primary), 0.08)',
            '0 0 0 1px hsla(var(--primary), 0.15), inset 0 0 40px hsla(var(--primary), 0.02)',
          ],
        } : {
          boxShadow: '0 0 0 0 transparent',
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Outer Glow Ring on Hover */}
      {isHovered && !prefersReducedMotion && (
        <motion.div
          className="absolute -inset-1 rounded-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--accent), 0.08))',
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {children}

        {/* Secondary Content - Reveal on Hover */}
        <AnimatePresence>
          {isHovered && (secondaryContent || lastUpdated) && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pt-4 mt-4 border-t border-border/30"
            >
              {secondaryContent}
              {lastUpdated && !secondaryContent && (
                <p className="text-xs text-muted-foreground">
                  Last updated {lastUpdated}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crystal Shimmer Effect on Hover */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsla(var(--accent), 0.15) 25%, hsla(255, 255, 255, 0.1) 50%, hsla(var(--accent), 0.15) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          initial={{ opacity: 0, x: '-100%' }}
          animate={isHovered ? {
            opacity: [0, 0.8, 0],
            x: ['-100%', '100%'],
          } : { opacity: 0, x: '-100%' }}
          transition={{
            duration: 1.2,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Inner Glass Highlight */}
      <div 
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsla(255, 255, 255, 0.2) 50%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}
