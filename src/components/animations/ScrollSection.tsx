import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ReactNode } from 'react';

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * ScrollSection - Section with scroll-linked animations
 * Fades in and slides up as it enters the viewport
 */
export function ScrollSection({ children, className = '', id }: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { opacity, y, scale } = useScrollAnimation(ref);

  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ opacity, y, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
