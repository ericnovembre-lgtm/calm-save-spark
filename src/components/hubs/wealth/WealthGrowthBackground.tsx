import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function WealthGrowthBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Radial Gradient Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-accent/10 to-transparent blur-3xl" />
      
      {/* Animated Growth Lines */}
      {!prefersReducedMotion && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              style={{
                left: `${i * 15}%`,
                width: '200px',
                bottom: -100,
              }}
              animate={{
                y: [-100, -window.innerHeight - 100],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear",
              }}
            />
          ))}

          {/* Ascending Dots */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-1 h-1 rounded-full bg-accent/40"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: -20,
              }}
              animate={{
                y: [-20, -window.innerHeight - 20],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-background/50" />
    </div>
  );
}
