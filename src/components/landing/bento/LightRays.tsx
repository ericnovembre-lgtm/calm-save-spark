import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const LightRays = () => {
  const prefersReducedMotion = useReducedMotion();

  const rays = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    rotation: i * 45,
  }));

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute w-1 bg-gradient-to-t from-green-500/0 via-green-500/20 to-green-500/0"
          style={{
            height: '200%',
            transformOrigin: 'center',
            rotate: ray.rotation,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: ray.id * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Central glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-green-500/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
