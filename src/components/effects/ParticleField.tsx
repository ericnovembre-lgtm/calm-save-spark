import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'up' | 'down' | 'random';
  className?: string;
}

/**
 * ParticleField - Ambient floating particles
 * Creates a subtle field of glowing dots drifting through the background
 */
export function ParticleField({
  count = 30,
  color = 'var(--primary)',
  minSize = 2,
  maxSize = 4,
  speed = 'normal',
  direction = 'up',
  className,
}: ParticleFieldProps) {
  const prefersReducedMotion = useReducedMotion();

  const speedMultiplier = {
    slow: 1.5,
    normal: 1,
    fast: 0.6,
  }[speed];

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: (15 + Math.random() * 20) * speedMultiplier,
      delay: Math.random() * -20,
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, [count, minSize, maxSize, speedMultiplier]);

  if (prefersReducedMotion) {
    // Show static particles for reduced motion
    return (
      <div className={`absolute inset-0 overflow-hidden ${className || ''}`}>
        {particles.slice(0, Math.floor(count / 3)).map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: `hsl(${color} / ${particle.opacity})`,
              boxShadow: `0 0 ${particle.size * 2}px hsl(${color} / ${particle.opacity * 0.5})`,
            }}
          />
        ))}
      </div>
    );
  }

  const getAnimation = (particle: Particle) => {
    const baseY = direction === 'up' ? ['100%', '-10%'] : direction === 'down' ? ['-10%', '100%'] : undefined;
    const randomY = direction === 'random' 
      ? [`${particle.y}%`, `${(particle.y + 30) % 100}%`, `${particle.y}%`]
      : baseY;

    return {
      y: randomY,
      x: [
        `${particle.x}%`,
        `${particle.x + (Math.random() - 0.5) * 10}%`,
        `${particle.x}%`,
      ],
      opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
    };
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: `hsl(${color} / ${particle.opacity})`,
            boxShadow: `0 0 ${particle.size * 3}px hsl(${color} / ${particle.opacity * 0.6})`,
            filter: 'blur(0.5px)',
          }}
          initial={{
            x: `${particle.x}%`,
            y: direction === 'up' ? '100%' : direction === 'down' ? '-10%' : `${particle.y}%`,
            opacity: 0,
          }}
          animate={getAnimation(particle)}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/**
 * GlowOrb - Single glowing orb that follows mouse
 */
export function GlowOrb({
  size = 200,
  color = 'var(--primary)',
  intensity = 0.15,
}: {
  size?: number;
  color?: string;
  intensity?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(${color} / ${intensity}) 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [intensity, intensity * 1.2, intensity],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
