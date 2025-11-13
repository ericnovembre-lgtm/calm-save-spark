import { ProgressRing } from "@/components/ProgressRing";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface GoalProgressCardProps {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  icon?: string;
}

export const GoalProgressCard = ({ 
  name, 
  currentAmount, 
  targetAmount, 
  icon = "target" 
}: GoalProgressCardProps) => {
  const progress = (currentAmount / targetAmount) * 100;
  const prefersReducedMotion = useReducedMotion();
  
  // Get the icon component dynamically
  const iconName = icon.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') as keyof typeof Icons;
  
  const IconComponent = (Icons[iconName] || Icons.Target) as LucideIcon;

  return (
    <motion.div 
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-soft)] hover:border-primary/20 border border-transparent cursor-pointer group"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20"
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          >
            <IconComponent className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">
              ${currentAmount.toLocaleString()} of ${targetAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <ProgressRing progress={progress} size={100} strokeWidth={8} />
    </motion.div>
  );
};
