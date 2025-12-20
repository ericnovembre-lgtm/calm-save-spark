import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface DashboardWidgetCardProps {
  children: ReactNode;
  className?: string;
  secondaryContent?: ReactNode;
  lastUpdated?: string;
  onClick?: () => void;
}

/**
 * DashboardWidgetCard - "Sentient Bento Card" with dynamic borders and content reveal
 * Features:
 * - Dynamic pulsing border on hover
 * - Secondary content slides up and fades in on hover
 * - Ultra-clean default state
 */
export function DashboardWidgetCard({
  children,
  className,
  secondaryContent,
  lastUpdated,
  onClick,
}: DashboardWidgetCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-card/80 backdrop-blur-xl',
        'border border-border/50',
        'transition-all duration-500',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        willChange: 'transform, box-shadow',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={!prefersReducedMotion ? {
        y: -2,
        boxShadow: '0 0 0 1px hsla(var(--primary), 0.2), 0 8px 32px -8px hsla(var(--primary), 0.15)',
      } : undefined}
      whileTap={onClick && !prefersReducedMotion ? { scale: 0.98 } : undefined}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Animated Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'transparent',
          boxShadow: isHovered 
            ? '0 0 0 1px hsla(var(--primary), 0.3), inset 0 0 40px hsla(var(--primary), 0.05)'
            : '0 0 0 0 transparent',
        }}
        animate={isHovered && !prefersReducedMotion ? {
          boxShadow: [
            '0 0 0 1px hsla(var(--primary), 0.2), inset 0 0 30px hsla(var(--primary), 0.03)',
            '0 0 0 2px hsla(var(--primary), 0.3), inset 0 0 40px hsla(var(--primary), 0.06)',
            '0 0 0 1px hsla(var(--primary), 0.2), inset 0 0 30px hsla(var(--primary), 0.03)',
          ],
        } : undefined}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

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

      {/* Shimmer Effect on Hover */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsla(var(--accent), 0.08) 50%, transparent 100%)',
            transform: 'translateX(-100%)',
          }}
          animate={isHovered ? {
            transform: ['translateX(-100%)', 'translateX(100%)'],
          } : undefined}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
