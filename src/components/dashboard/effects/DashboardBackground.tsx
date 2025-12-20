import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useMemo, useEffect } from 'react';

// Floating orb configurations - organic shapes with varied sizes
const FLOATING_ORBS = [
  { id: 1, size: 220, initialX: '15%', initialY: '20%', color: 'accent', delay: 0 },
  { id: 2, size: 180, initialX: '75%', initialY: '15%', color: 'primary', delay: 1.5 },
  { id: 3, size: 280, initialX: '55%', initialY: '65%', color: 'secondary', delay: 3 },
  { id: 4, size: 150, initialX: '85%', initialY: '70%', color: 'accent', delay: 4.5 },
  { id: 5, size: 200, initialX: '25%', initialY: '80%', color: 'primary', delay: 2 },
  { id: 6, size: 160, initialX: '45%', initialY: '35%', color: 'secondary', delay: 5.5 },
];

// Max parallax offset in pixels
const MAX_PARALLAX = 35;

/**
 * DashboardBackground - "Living Horizon" Fluid Aurora Background
 * Creates a calm, breathing mesh gradient with noise texture overlay
 * and floating ambient orbs with parallax effect
 */
export function DashboardBackground() {
  const prefersReducedMotion = useReducedMotion();
  const { floatingOrbsEnabled } = useAccessibilityPreferences();
  const mousePosition = useMousePosition();

  // Create smooth spring values for parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Update motion values when mouse moves
  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition.x, mousePosition.y, mouseX, mouseY]);

  // Apply spring physics for smooth movement
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  // Only show orbs if enabled AND reduced motion is not preferred
  const showOrbs = floatingOrbsEnabled && !prefersReducedMotion;

  // Generate random organic paths for orbs
  const orbAnimations = useMemo(() => {
    return FLOATING_ORBS.map((orb) => ({
      ...orb,
      xPath: [0, 30 + Math.random() * 20, -20 - Math.random() * 15, 15 + Math.random() * 10, 0],
      yPath: [0, -25 - Math.random() * 15, 20 + Math.random() * 10, -10 - Math.random() * 10, 0],
      scalePath: [1, 1.05 + Math.random() * 0.05, 0.95 - Math.random() * 0.03, 1.02, 1],
      duration: 20 + Math.random() * 10,
      // Parallax strength: smaller orbs move more (depth illusion)
      parallaxStrength: 1 - (orb.size / 400),
    }));
  }, []);

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-700"
      aria-hidden="true"
    >
      {/* Floating Ambient Orbs with Parallax */}
      {showOrbs && orbAnimations.map((orb) => {
        // Calculate parallax offset based on orb size
        const parallaxX = useTransform(smoothX, [0, 1], [
          -MAX_PARALLAX * orb.parallaxStrength,
          MAX_PARALLAX * orb.parallaxStrength,
        ]);
        const parallaxY = useTransform(smoothY, [0, 1], [
          -MAX_PARALLAX * orb.parallaxStrength,
          MAX_PARALLAX * orb.parallaxStrength,
        ]);

        return (
          <motion.div
            key={orb.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.initialX,
              top: orb.initialY,
              background: `radial-gradient(circle, var(--aurora-orb-${orb.color}) 0%, transparent 70%)`,
              filter: 'blur(50px)',
              willChange: 'transform',
              x: parallaxX,
              y: parallaxY,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.5, 0.35, 0.45, 0.3],
              scale: orb.scalePath,
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Fluid Aurora Mesh Gradient - Primary Layer - Theme-Aware */}
      <motion.div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 20% 20%, var(--aurora-primary) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 15%, var(--aurora-accent) 0%, transparent 55%),
            radial-gradient(ellipse 90% 80% at 50% 90%, var(--aurora-secondary) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 50%, var(--aurora-glow) 0%, transparent 50%),
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

      {/* Secondary Aurora Layer - Morphing Colors - Theme-Aware */}
      <motion.div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 25% 75%, var(--aurora-accent) 0%, transparent 65%),
            radial-gradient(ellipse 60% 70% at 85% 35%, var(--aurora-glow) 0%, transparent 50%)
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

      {/* Central Breathing Glow Pulse - Theme-Aware */}
      <motion.div
        className="absolute inset-0 pointer-events-none transition-[background] duration-700"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, var(--aurora-center) 0%, transparent 60%)
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

      {/* Tertiary Color Wave - Theme-Aware */}
      <motion.div
        className="absolute inset-0 pointer-events-none transition-[background] duration-700"
        style={{
          background: `
            radial-gradient(ellipse 120% 60% at 10% 50%, var(--aurora-secondary) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 90% 60%, var(--aurora-accent) 0%, transparent 45%)
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
