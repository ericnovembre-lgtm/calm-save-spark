import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface ParticleSystemProps {
  count?: number;
  color?: string;
  trigger?: boolean;
  className?: string;
}

export const ParticleSystem = ({ 
  count = 20, 
  color = 'hsl(var(--primary))',
  trigger = false,
  className = ''
}: ParticleSystemProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (prefersReducedMotion || !trigger) return;

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 1 + 0.5,
      delay: Math.random() * 0.2,
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [trigger, count, prefersReducedMotion]);

  if (prefersReducedMotion || particles.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map(particle => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 100;
        const endX = particle.x + Math.cos(angle) * distance;
        const endY = particle.y + Math.sin(angle) * distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
            }}
            initial={{ 
              opacity: 1, 
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
              x: endX - particle.x + '%',
              y: endY - particle.y + '%',
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
};
