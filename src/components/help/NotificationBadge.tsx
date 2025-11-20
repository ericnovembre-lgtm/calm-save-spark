import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (count <= 0) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center ${className}`}
      style={{
        boxShadow: '0 0 10px rgba(var(--destructive) / 0.5)',
      }}
    >
      <span>
        {count > 9 ? '9+' : count}
      </span>
    </motion.div>
  );
}
