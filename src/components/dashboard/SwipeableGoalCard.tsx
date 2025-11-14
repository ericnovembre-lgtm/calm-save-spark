import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Share2, Edit, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SaveplusAnimIcon } from "@/components/icons";
import { EnhancedProgressRing } from "./EnhancedProgressRing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { toast } from "sonner";

interface SwipeableGoalCardProps {
  id: string;
  title: string;
  current: number;
  target: number;
  deadline?: string;
  contributionHistory?: number[];
}

export function SwipeableGoalCard({ 
  id,
  title, 
  current, 
  target,
  deadline,
  contributionHistory = []
}: SwipeableGoalCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isFlipped, setIsFlipped] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const progress = (current / target) * 100;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - Edit
      toast.info("Opening goal editor...");
      x.set(0);
    } else if (info.offset.x < -threshold) {
      // Swiped left - Quick transfer
      toast.success("Opening quick transfer...");
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const handleLongPressStart = () => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => {
      toast.success("Share goal achievement", {
        description: "Feature coming soon!"
      });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const projectedCompletion = () => {
    if (contributionHistory.length < 2) return "Unknown";
    const avgContribution = contributionHistory.reduce((a, b) => a + b, 0) / contributionHistory.length;
    const remaining = target - current;
    const monthsLeft = Math.ceil(remaining / avgContribution);
    return `~${monthsLeft} months`;
  };

  return (
    <motion.div
      className="relative touch-pan-y"
      style={{ x, opacity }}
      drag={!prefersReducedMotion ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      onPointerDown={handleLongPressStart}
      onPointerUp={handleLongPressEnd}
      onPointerLeave={handleLongPressEnd}
    >
      {/* Swipe action hints */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div
          className="flex items-center gap-2 text-primary"
          style={{
            opacity: useTransform(x, [0, 50], [0, 1])
          }}
        >
          <Edit className="w-5 h-5" />
          <span className="text-sm font-semibold">Edit</span>
        </motion.div>
        
        <motion.div
          className="flex items-center gap-2 text-primary"
          style={{
            opacity: useTransform(x, [-50, 0], [1, 0])
          }}
        >
          <span className="text-sm font-semibold">Transfer</span>
          <DollarSign className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Card with flip animation */}
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => !prefersReducedMotion && setIsFlipped(!isFlipped)}
      >
        {/* Front side */}
        <motion.div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          <GlassCard className="p-6 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <motion.div 
                  className="mb-3"
                  whileHover={!prefersReducedMotion ? { scale: 1.1, rotate: [0, -5, 5, 0] } : undefined}
                >
                  <SaveplusAnimIcon name="goals" size={36} className="text-primary" decorative />
                </motion.div>
                
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {title}
                </h3>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    ${current.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ${target.toLocaleString()}
                  </p>
                  {deadline && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <EnhancedProgressRing progress={progress} size={90} strokeWidth={7} />
            </div>

            {/* Tap to flip hint */}
            <div className="text-xs text-center text-muted-foreground mt-4 opacity-50">
              Tap to see details • Swipe for actions
            </div>
          </GlassCard>
        </motion.div>

        {/* Back side */}
        <motion.div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            rotateY: 180
          }}
        >
          <GlassCard className="p-6 h-full cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Goal Details</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Back
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-semibold">{progress.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-semibold">${(target - current).toLocaleString()}</span>
                </div>

                {contributionHistory.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Monthly:</span>
                      <span className="font-semibold">
                        ${(contributionHistory.reduce((a, b) => a + b, 0) / contributionHistory.length).toFixed(0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Completion:</span>
                      <span className="font-semibold">{projectedCompletion()}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Fast Track Suggestion:</p>
                  <p className="text-xs">
                    Increase contributions by ${Math.ceil((target - current) * 0.1)} to reach goal 10% faster
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
