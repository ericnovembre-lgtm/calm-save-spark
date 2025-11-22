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
      className="h-full p-6 rounded-3xl bg-card border border-border backdrop-blur-xl overflow-hidden relative group"
      whileHover={prefersReducedMotion ? {} : {
        y: -4,
        boxShadow: '0 20px 40px -10px hsl(var(--accent) / 0.2)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-3">
          <motion.div
            className="p-2 rounded-xl bg-accent/10 text-accent"
            whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </motion.div>
  );
};
