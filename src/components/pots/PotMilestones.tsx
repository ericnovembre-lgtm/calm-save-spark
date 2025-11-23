import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Star } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Milestone {
  percentage: number;
  label: string;
  icon: typeof Trophy;
  reached: boolean;
}

interface PotMilestonesProps {
  progress: number;
  targetAmount: number;
}

export const PotMilestones = ({ progress, targetAmount }: PotMilestonesProps) => {
  const prefersReducedMotion = useReducedMotion();

  const milestones: Milestone[] = [
    { percentage: 25, label: "First Quarter", icon: Star, reached: progress >= 25 },
    { percentage: 50, label: "Halfway There", icon: TrendingUp, reached: progress >= 50 },
    { percentage: 75, label: "Almost Done", icon: Target, reached: progress >= 75 },
  ];

  return (
    <div className="space-y-2 mt-3">
      {/* Milestone Progress Bar */}
      <div className="relative h-1.5 bg-background/30 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Milestone Markers */}
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.percentage}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${milestone.percentage}%` }}
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                milestone.reached
                  ? "bg-primary border-primary shadow-lg shadow-primary/50"
                  : "bg-background/50 border-muted-foreground/30"
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Milestone Labels */}
      <div className="flex justify-between items-start text-xs px-1">
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.percentage}
            className={`flex flex-col items-center gap-1 transition-all ${
              milestone.reached ? "text-primary" : "text-muted-foreground/60"
            }`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
            animate={{ 
              opacity: milestone.reached ? 1 : 0.5,
              y: 0,
              scale: milestone.reached ? 1.05 : 1
            }}
            transition={{ delay: 0.5 }}
          >
            <milestone.icon 
              className={`w-3.5 h-3.5 ${
                milestone.reached ? "text-primary" : "text-muted-foreground/40"
              }`}
            />
            <span className="font-medium whitespace-nowrap text-[10px]">
              {milestone.percentage}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Next Milestone Info */}
      {progress < 100 && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center pt-1"
        >
          {(() => {
            const nextMilestone = milestones.find(m => !m.reached);
            if (!nextMilestone) return "Final push to 100%!";
            
            const amountToNext = targetAmount * (nextMilestone.percentage / 100) - (targetAmount * (progress / 100));
            return `$${Math.max(0, amountToNext).toFixed(0)} to ${nextMilestone.label}`;
          })()}
        </motion.div>
      )}
    </div>
  );
};
