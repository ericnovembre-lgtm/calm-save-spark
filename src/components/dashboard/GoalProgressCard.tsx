import { ProgressRing } from "@/components/ProgressRing";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useState, useEffect } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

import { memo } from "react";
import { createPropsComparator } from "@/lib/memo";

interface GoalProgressCardProps {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  icon?: string;
}

export const GoalProgressCard = memo(function GoalProgressCard({
  id,
  name, 
  currentAmount, 
  targetAmount, 
  icon = "target" 
}: GoalProgressCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  
  // Get the icon component dynamically
  const iconName = icon.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') as keyof typeof Icons;
  
  const IconComponent = (Icons[iconName] || Icons.Target) as LucideIcon;

  // Trigger confetti when goal is achieved
  useEffect(() => {
    if (progress >= 100 && !hasShownConfetti) {
      setShowConfetti(true);
      triggerHaptic('success');
      setHasShownConfetti(true);
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress, hasShownConfetti, triggerHaptic]);

  const handleMilestone = () => {
    triggerHaptic('light');
  };

  return (
    <>
      <motion.div 
        className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-soft)] hover:border-primary/20 border border-transparent cursor-pointer group relative overflow-hidden"
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
        <ProgressRing 
          progress={progress} 
          size={100} 
          strokeWidth={8} 
          showParticles={true}
          onMilestone={handleMilestone}
        />
      </motion.div>

      {/* Goal Achievement Confetti */}
      {showConfetti && <NeutralConfetti show={showConfetti} />}
    </>
  );
}, createPropsComparator<GoalProgressCardProps>('id', 'currentAmount', 'targetAmount'));
