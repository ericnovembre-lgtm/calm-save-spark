import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  delay?: number;
}

/**
 * ChartWrapper - Animated wrapper for chart components
 * Provides consistent entrance animations for all charts
 */
export function ChartWrapper({ children, delay = 0 }: ChartWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1],
        delay 
      }}
    >
      {children}
    </motion.div>
  );
}
