import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMemo } from 'react';

export function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const particles = useMemo(() => {
    // Reduce particle count by 80% on mobile (15 -> 3)
    const count = isMobile ? 3 : 15;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, [isMobile]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: 'hsl(var(--accent))',
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
