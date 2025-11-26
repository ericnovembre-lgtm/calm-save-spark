import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Coins, Gem, TrendingUp } from 'lucide-react';

const particles = [
  { Icon: Coins, color: 'text-yellow-500/30' },
  { Icon: Gem, color: 'text-cyan-500/30' },
  { Icon: TrendingUp, color: 'text-green-500/30' },
];

export function WealthParticles() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => {
        const particle = particles[i % particles.length];
        const Icon = particle.Icon;
        
        return (
          <motion.div
            key={i}
            className={`absolute ${particle.color}`}
            style={{
              left: `${10 + i * 15}%`,
              bottom: -50,
            }}
            animate={{
              y: [-50, -window.innerHeight - 100],
              x: [0, Math.sin(i) * 50, 0],
              rotate: [0, 360],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        );
      })}
    </div>
  );
}
