import { motion } from 'framer-motion';

/**
 * Aurora borealis-style glow effect
 * Subtle animated gradient overlay
 */
export const AuroraGlow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsl(var(--accent) / 0.1), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, hsl(var(--primary) / 0.08), transparent)
          `
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Moving light beam */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.05), transparent)'
        }}
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};
