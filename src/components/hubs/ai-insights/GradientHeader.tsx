import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const GradientHeader = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mb-10">
      <motion.h1
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Subtle glow behind text */}
        <motion.span
          className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-accent/40 via-primary/20 to-accent/40 pointer-events-none"
          animate={prefersReducedMotion ? {} : {
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.span
          className="inline-block bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent relative"
          style={{
            backgroundSize: '200% auto',
          }}
          animate={prefersReducedMotion ? {} : {
            backgroundPosition: ['0% center', '200% center'],
          }}
          transition={{
            duration: 6,
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

      {/* Decorative line with accent dots */}
      <motion.div
        className="mt-6 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-accent/60"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-primary/30 via-accent/20 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ originX: 0 }}
        />
        <motion.div
          className="w-1 h-1 rounded-full bg-muted-foreground/40"
          animate={prefersReducedMotion ? {} : {
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
};
