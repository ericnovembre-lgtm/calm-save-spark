import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * DashboardBackground - "Living Horizon" Fluid Aurora Background
 * Creates a calm, breathing mesh gradient with noise texture overlay
 */
export function DashboardBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Fluid Aurora Mesh Gradient - Primary Layer - MAXIMUM VISIBILITY */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 20% 20%, hsla(var(--primary), 0.45) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 15%, hsla(var(--accent), 0.50) 0%, transparent 55%),
            radial-gradient(ellipse 90% 80% at 50% 90%, hsla(var(--secondary), 0.55) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 50%, hsla(var(--primary), 0.30) 0%, transparent 50%),
            hsl(var(--background))
          `,
          willChange: prefersReducedMotion ? 'auto' : 'transform',
        }}
        animate={!prefersReducedMotion ? {
          scale: [1, 1.03, 1.01, 1],
          opacity: [1, 0.92, 0.98, 1],
        } : undefined}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary Aurora Layer - Morphing Colors - MAXIMUM VISIBILITY */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 25% 75%, hsla(var(--accent), 0.40) 0%, transparent 65%),
            radial-gradient(ellipse 60% 70% at 85% 35%, hsla(var(--primary), 0.28) 0%, transparent 50%)
          `,
          willChange: prefersReducedMotion ? 'auto' : 'transform',
        }}
        animate={!prefersReducedMotion ? {
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
          scale: [1, 1.05, 0.97, 1],
        } : undefined}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Central Breathing Glow Pulse - MAXIMUM VISIBILITY */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, hsla(var(--accent), 0.30) 0%, transparent 60%)
          `,
        }}
        animate={!prefersReducedMotion ? {
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.15, 1],
        } : undefined}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Tertiary Color Wave - MAXIMUM VISIBILITY */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 60% at 10% 50%, hsla(var(--secondary), 0.35) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 90% 60%, hsla(var(--accent), 0.30) 0%, transparent 45%)
          `,
        }}
        animate={!prefersReducedMotion ? {
          x: [-10, 20, -10],
          opacity: [0.7, 1, 0.7],
        } : undefined}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise Texture Overlay - Premium Paper Feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle Horizon Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsla(var(--border), 0.4) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
