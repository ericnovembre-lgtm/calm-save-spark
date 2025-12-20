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
      {/* Fluid Aurora Mesh Gradient - Primary Layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, hsla(var(--primary), 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, hsla(var(--accent), 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 50% 80%, hsla(var(--secondary), 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 70% 60%, hsla(var(--primary), 0.1) 0%, transparent 50%),
            hsl(var(--background))
          `,
          willChange: prefersReducedMotion ? 'auto' : 'transform',
        }}
        animate={!prefersReducedMotion ? {
          scale: [1, 1.02, 1.01, 1],
          opacity: [1, 0.95, 1],
        } : undefined}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary Aurora Layer - Morphing Colors */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 30% 70%, hsla(var(--accent), 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 90% 40%, hsla(var(--primary), 0.08) 0%, transparent 40%)
          `,
          willChange: prefersReducedMotion ? 'auto' : 'transform',
        }}
        animate={!prefersReducedMotion ? {
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0],
          scale: [1, 1.03, 0.98, 1],
        } : undefined}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Breathing Glow Pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, hsla(var(--accent), 0.08) 0%, transparent 70%)
          `,
        }}
        animate={!prefersReducedMotion ? {
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        } : undefined}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise Texture Overlay - Premium Paper Feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle Horizon Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsla(var(--border), 0.3) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
