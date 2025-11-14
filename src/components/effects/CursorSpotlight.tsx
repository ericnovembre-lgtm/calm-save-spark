import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CursorSpotlightProps {
  color?: string;
  size?: number;
  opacity?: number;
}

export function CursorSpotlight({ 
  color = 'hsl(var(--primary))',
  size = 400,
  opacity = 0.08
}: CursorSpotlightProps) {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Check if device has a mouse (not touch-only)
    const hasPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointerFine) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  // Don't show on touch devices
  const hasPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!hasPointerFine) return null;

  return (
    <motion.div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: `radial-gradient(circle ${size}px at ${x}px ${y}px, ${color.replace(')', `, ${opacity})`).replace('hsl', 'hsla')} 0%, transparent 100%)`
      }}
      aria-hidden="true"
    />
  );
}
