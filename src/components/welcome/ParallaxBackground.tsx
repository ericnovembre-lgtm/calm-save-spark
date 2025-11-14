import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const ParallaxBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Create multiple parallax layers with different speeds
  const y1 = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : -300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 'var(--z-background)' } as React.CSSProperties}
    >
      {/* Layer 1 - Slowest */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute inset-0"
      >
        <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </motion.div>

      {/* Layer 2 - Medium speed */}
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute inset-0"
      >
        <div className="absolute top-[40%] right-[20%] w-48 h-48 rounded-full bg-primary/3 blur-2xl" />
        <div className="absolute bottom-[40%] left-[25%] w-56 h-56 rounded-full bg-accent/3 blur-2xl" />
      </motion.div>

      {/* Layer 3 - Fastest */}
      <motion.div
        style={{ y: y3, opacity }}
        className="absolute inset-0"
      >
        <div className="absolute top-[60%] left-[40%] w-32 h-32 rounded-full bg-primary/4 blur-xl" />
        <div className="absolute top-[25%] right-[35%] w-40 h-40 rounded-full bg-accent/4 blur-xl" />
      </motion.div>
    </div>
  );
};
