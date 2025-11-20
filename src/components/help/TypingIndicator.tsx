import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion();

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-muted/50 rounded-lg w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          variants={prefersReducedMotion ? {} : dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
