import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface BentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}

export const BentoCard = ({ title, description, icon, children }: BentoCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full p-6 rounded-3xl bg-card/80 border border-border backdrop-blur-xl overflow-hidden relative group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-premium)] transition-all duration-300"
      whileHover={prefersReducedMotion ? {} : {
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-3">
          <motion.div
            className="p-2.5 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20"
            whileHover={prefersReducedMotion ? {} : { rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 font-light">{description}</p>
          </div>
        </div>
        
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </motion.div>
  );
};
