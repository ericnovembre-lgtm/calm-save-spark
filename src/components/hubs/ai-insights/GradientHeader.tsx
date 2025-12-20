import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const GradientHeader = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mb-10">
      <motion.h1
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.span
          className="inline-block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          style={{
            backgroundSize: '200% auto',
          }}
          animate={prefersReducedMotion ? {} : {
            backgroundPosition: ['0% center', '200% center'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          AI & Insights
        </motion.span>
      </motion.h1>
      
      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        Your intelligent command center for smarter financial decisions
      </motion.p>

      {/* Decorative line */}
      <motion.div
        className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </div>
  );
};
