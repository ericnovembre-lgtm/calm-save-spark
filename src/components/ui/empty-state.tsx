import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ANIMATION_VARIANTS, ANIMATION_DURATION } from '@/lib/animation-constants';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'goals' | 'transactions' | 'insights' | 'analytics' | 'default';
}

const VARIANT_STYLES = {
  goals: {
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    emoji: '🎯',
  },
  transactions: {
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    emoji: '💸',
  },
  insights: {
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
    emoji: '💡',
  },
  analytics: {
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted/10',
    emoji: '📊',
  },
  default: {
    iconColor: 'text-foreground',
    iconBg: 'bg-muted/10',
    emoji: '✨',
  },
} as const;

/**
 * Empty State Component
 * Consistent, encouraging empty states with illustrations and CTAs
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const style = VARIANT_STYLES[variant];

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : ANIMATION_VARIANTS.fadeIn}
      initial={prefersReducedMotion ? false : 'initial'}
      animate="animate"
      transition={{ duration: ANIMATION_DURATION.normal / 1000 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Icon Container */}
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: ANIMATION_DURATION.normal / 1000,
          delay: 0.1,
        }}
        className={`p-4 rounded-2xl ${style.iconBg} mb-4`}
      >
        <Icon className={`w-12 h-12 ${style.iconColor}`} />
      </motion.div>

      {/* Emoji */}
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: ANIMATION_DURATION.normal / 1000,
          delay: 0.2,
        }}
        className="text-4xl mb-3"
      >
        {style.emoji}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: ANIMATION_DURATION.normal / 1000,
          delay: 0.3,
        }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: ANIMATION_DURATION.normal / 1000,
          delay: 0.4,
        }}
        className="text-sm text-muted-foreground max-w-md mb-6"
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_DURATION.normal / 1000,
            delay: 0.5,
          }}
        >
          <Button onClick={onAction} size="lg" className="touch-target">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}