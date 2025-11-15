import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SectionDividerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const SectionDivider = ({ title, subtitle, icon }: SectionDividerProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative py-8"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-4 bg-background px-6">
        {icon && (
          <motion.div
            className="text-primary"
            animate={prefersReducedMotion ? {} : {
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>
        )}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
