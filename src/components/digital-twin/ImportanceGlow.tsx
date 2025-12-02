import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImportanceGlowProps {
  importance: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated glowing indicator that pulses based on importance level
 * 0.0-0.3: White/Gray (subtle pulse)
 * 0.3-0.6: Cyan (moderate pulse)
 * 0.6-0.8: Yellow (faster pulse)
 * 0.8-1.0: Magenta/Red (intense pulse)
 */
export function ImportanceGlow({ importance, children, className }: ImportanceGlowProps) {
  // Get color based on importance
  const getGlowColor = () => {
    if (importance >= 0.8) return { color: 'rgb(236, 72, 153)', glow: 'rgba(236, 72, 153, 0.6)' }; // Pink/magenta
    if (importance >= 0.6) return { color: 'rgb(234, 179, 8)', glow: 'rgba(234, 179, 8, 0.5)' }; // Yellow
    if (importance >= 0.3) return { color: 'rgb(6, 182, 212)', glow: 'rgba(6, 182, 212, 0.4)' }; // Cyan
    return { color: 'rgb(148, 163, 184)', glow: 'rgba(148, 163, 184, 0.3)' }; // Gray
  };

  // Get animation duration based on importance (faster = more important)
  const getDuration = () => {
    if (importance >= 0.8) return 0.8;
    if (importance >= 0.6) return 1.2;
    if (importance >= 0.3) return 1.8;
    return 2.5;
  };

  // Get glow spread based on importance
  const getSpread = () => {
    if (importance >= 0.8) return { min: 4, max: 12 };
    if (importance >= 0.6) return { min: 3, max: 8 };
    if (importance >= 0.3) return { min: 2, max: 6 };
    return { min: 1, max: 4 };
  };

  const colors = getGlowColor();
  const duration = getDuration();
  const spread = getSpread();

  return (
    <motion.div
      className={cn("relative inline-flex", className)}
      animate={{
        boxShadow: [
          `0 0 ${spread.min}px ${colors.glow}`,
          `0 0 ${spread.max}px ${colors.glow}`,
          `0 0 ${spread.min}px ${colors.glow}`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        borderRadius: '50%',
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ color: colors.color }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
