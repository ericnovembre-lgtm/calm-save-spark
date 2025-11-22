import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const AuroraBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 bg-background -z-10">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, hsl(280 100% 70% / 0.3), transparent),
                radial-gradient(ellipse 60% 40% at 80% 60%, hsl(200 100% 70% / 0.2), transparent),
                radial-gradient(ellipse 60% 40% at 20% 80%, hsl(280 100% 70% / 0.15), transparent)
              `,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Aurora Gradient Layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsl(280 100% 70% / 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsl(200 100% 70% / 0.2), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, hsl(280 100% 70% / 0.15), transparent)
          `,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Moving Light Beam */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.08), transparent)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Secondary Gradient Shift */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 30% 40%, hsl(180 100% 70% / 0.15), transparent),
            radial-gradient(ellipse 50% 60% at 70% 70%, hsl(280 100% 70% / 0.1), transparent)
          `,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
      
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
};
