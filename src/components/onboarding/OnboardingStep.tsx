import { motion } from 'framer-motion';

interface OnboardingStepProps {
  icon: string;
  title: string;
  description: string;
}

export function OnboardingStep({ icon, title, description }: OnboardingStepProps) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="flex flex-col items-center">
      {/* Icon with animation */}
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          delay: 0.1 
        }}
        className="text-6xl mb-6"
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={reducedMotion ? {} : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-foreground mb-3"
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={reducedMotion ? {} : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
}
