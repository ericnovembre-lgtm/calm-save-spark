import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SaveplusAnimIcon } from "@/components/icons";
import { useEffect, useState } from "react";

interface ProgressBarPremiumProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const MILESTONES = [25, 50, 75];

export const ProgressBarPremium = ({ 
  currentStep, 
  totalSteps,
  stepLabels = []
}: ProgressBarPremiumProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  
  const progress = (currentStep / totalSteps) * 100;
  const avgTimePerStep = 45; // 45 seconds average per step
  const remainingSteps = totalSteps - currentStep;
  const estimatedSeconds = remainingSteps * avgTimePerStep;

  // Check for milestone celebrations
  useEffect(() => {
    MILESTONES.forEach(milestone => {
      if (progress >= milestone && !celebratedMilestones.includes(milestone)) {
        setCelebratedMilestones(prev => [...prev, milestone]);
      }
    });
  }, [progress, celebratedMilestones]);

  // Update estimated time
  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatedTime(estimatedSeconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [estimatedSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={prefersReducedMotion ? {} : {
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>

        {/* Milestone checkpoints */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-2">
          {Array.from({ length: totalSteps + 1 }).map((_, index) => {
            const stepProgress = (index / totalSteps) * 100;
            const isCompleted = currentStep >= index;
            const isCurrent = currentStep === index;
            
            return (
              <motion.div
                key={index}
                className="relative"
                style={{ left: `${stepProgress}%` }}
                initial={prefersReducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Checkpoint circle */}
                <motion.div
                  className={`w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-colors ${
                    isCompleted 
                      ? "bg-primary border-primary" 
                      : isCurrent
                      ? "bg-background border-primary"
                      : "bg-background border-muted"
                  }`}
                  animate={isCurrent && !prefersReducedMotion ? {
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0.4)",
                      "0 0 0 8px hsl(var(--primary) / 0)",
                      "0 0 0 0 hsl(var(--primary) / 0)"
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Checkmark for completed steps */}
                  {isCompleted && index < currentStep && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>

                {/* Step label */}
                {stepLabels[index] && (
                  <motion.div
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }}
                    animate={{ opacity: isCurrent ? 1 : 0.5, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {stepLabels[index]}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between mt-12 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SaveplusAnimIcon name="sparkles" size={16} />
          <span>Step {currentStep} of {totalSteps}</span>
        </div>
        
        {estimatedTime !== null && remainingSteps > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-muted-foreground"
          >
            About {formatTime(estimatedSeconds)} remaining
          </motion.div>
        )}
      </div>

      {/* Milestone celebrations */}
      {celebratedMilestones.map(milestone => (
        <motion.div
          key={milestone}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
        >
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">{milestone}% Complete!</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
