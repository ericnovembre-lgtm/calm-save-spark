import { ProgressRing } from "./ProgressRing";
import { SaveplusAnimIcon } from "@/components/icons";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  emoji?: string;
}

export const GoalCard = ({ title, current, target, emoji = "🎯" }: GoalCardProps) => {
  const progress = (current / target) * 100;
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] hover:border-primary/20 border border-transparent cursor-pointer"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <motion.div 
            className="mb-2"
            initial={prefersReducedMotion ? false : { scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SaveplusAnimIcon name="goals" size={32} decorative />
          </motion.div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            ${current.toLocaleString()} of ${target.toLocaleString()}
          </p>
        </div>
        <ProgressRing progress={progress} size={80} strokeWidth={6} />
      </div>
    </motion.div>
  );
};
