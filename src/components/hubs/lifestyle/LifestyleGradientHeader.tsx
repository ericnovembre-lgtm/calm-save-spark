import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Heart } from 'lucide-react';

export const LifestyleGradientHeader = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mb-12 text-center relative">
      {/* Subtle glow behind title */}
      <motion.span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--accent) / 0.4), hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.4))',
        }}
        animate={prefersReducedMotion ? {} : {
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Icon with heartbeat animation */}
      <motion.div 
        className="flex justify-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20 flex items-center justify-center relative">
          {/* Pulsing glow behind icon */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent) / 0.3), transparent 70%)',
            }}
            animate={prefersReducedMotion ? {} : {
              opacity: [0.2, 0.4, 0.2, 0.35, 0.2],
              scale: [1, 1.1, 1, 1.05, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
          {/* Heart icon with heartbeat scale */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.15, 1, 1.1, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Heart className="w-7 h-7 text-foreground relative z-10" strokeWidth={1.8} />
          </motion.div>
        </div>
      </motion.div>

      {/* Animated gradient title */}
      <motion.h1 
        className="text-4xl md:text-5xl font-display font-bold mb-4 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.span
          className="bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent"
          style={{ 
            backgroundSize: '200% auto',
          }}
          animate={prefersReducedMotion ? {} : { 
            backgroundPosition: ['0% center', '200% center'] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        >
          Lifestyle Design
        </motion.span>
      </motion.h1>
      
      {/* Subtitle with staggered reveal */}
      <motion.p 
        className="text-muted-foreground text-lg max-w-xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Financial tools tailored to your life stage and goals
      </motion.p>

      {/* Decorative elements */}
      <motion.div 
        className="flex items-center justify-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="w-1.5 h-1.5 rounded-full bg-accent/40"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        />
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary/30"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div 
          className="w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        />
        <motion.div 
          className="w-1.5 h-1.5 rounded-full bg-accent/40"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
      </motion.div>
    </div>
  );
};
