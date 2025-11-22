import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function MagneticCursor() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Adaptive performance: Lower quality on lower-end devices
  const springConfig = { 
    stiffness: isMobile ? 100 : 150, 
    damping: isMobile ? 20 : 15, 
    mass: 0.1 
  };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    // Performance monitoring
    const startTime = performance.now();

    const updateCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') !== null ||
        target.closest('a') !== null;
      
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', updateCursor);
    
    // Log load time
    const loadTime = performance.now() - startTime;
    if (loadTime > 100) {
      console.warn('[MagneticCursor] Slow initialization:', loadTime, 'ms');
    }

    return () => window.removeEventListener('mousemove', updateCursor);
  }, [cursorX, cursorY, prefersReducedMotion, isMobile]);

  if (prefersReducedMotion || isMobile) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 40 : 20,
            height: isHovering ? 40 : 20,
          }}
          transition={{ duration: 0.2 }}
          className="rounded-full border-2 border-primary bg-primary/20"
        />
      </motion.div>

      {/* Trail dot */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        transition={{ delay: 0.05 }}
      >
        <div className="w-2 h-2 rounded-full bg-accent" />
      </motion.div>
    </>
  );
}
