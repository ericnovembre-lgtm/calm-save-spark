import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FundTransferParticlesProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  amount: number;
  onComplete?: () => void;
}

export function FundTransferParticles({ from, to, amount, onComplete }: FundTransferParticlesProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) return null;

  const particleCount = Math.min(Math.floor(amount / 20), 15);
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    angle: (Math.random() - 0.5) * 30, // Random spread
    distance: Math.random() * 50 + 20
  }));

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(particle => {
          // Calculate path with slight curve
          const midX = (from.x + to.x) / 2 + particle.distance * Math.sin(particle.angle * Math.PI / 180);
          const midY = (from.y + to.y) / 2 - 100; // Arc upward

          return (
            <motion.div
              key={particle.id}
              className="absolute"
              initial={{
                x: from.x,
                y: from.y,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: [from.x, midX, to.x],
                y: [from.y, midY, to.y],
                scale: [0, 1.2, 0.8],
                opacity: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-400 blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                />
                
                {/* Dollar sign */}
                <div className="relative w-8 h-8 flex items-center justify-center bg-emerald-500 rounded-full text-white shadow-lg">
                  <DollarSign className="w-5 h-5" strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Amount label at midpoint */}
        <motion.div
          className="absolute"
          initial={{
            x: from.x,
            y: from.y,
            scale: 0,
            opacity: 0
          }}
          animate={{
            x: (from.x + to.x) / 2,
            y: (from.y + to.y) / 2 - 120,
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-2xl">
            ${amount.toFixed(2)}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
