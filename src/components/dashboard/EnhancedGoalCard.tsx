import { motion } from "framer-motion";
import { ProgressRing } from "@/components/ProgressRing";
import { SaveplusAnimIcon } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInScale } from "@/lib/motion-variants";
import { Sparkles } from "lucide-react";

interface EnhancedGoalCardProps {
  title: string;
  current: number;
  target: number;
  emoji?: string;
  onClick?: () => void;
}

export const EnhancedGoalCard = ({ 
  title, 
  current, 
  target, 
  emoji = "🎯",
  onClick 
}: EnhancedGoalCardProps) => {
  const progress = (current / target) * 100;
  const prefersReducedMotion = useReducedMotion();
  const isNearCompletion = progress >= 75;
  
  return (
    <GlassCard 
      enableTilt 
      glowOnHover={isNearCompletion}
      onClick={onClick}
      className="p-6 overflow-hidden group"
    >
      <motion.div
        variants={!prefersReducedMotion ? fadeInScale : undefined}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            {/* Icon */}
            <motion.div 
              className="mb-3"
              whileHover={!prefersReducedMotion ? { 
                scale: 1.1,
                rotate: [0, -5, 5, 0]
              } : undefined}
              transition={{ duration: 0.4 }}
            >
              <SaveplusAnimIcon 
                name="goals" 
                size={36} 
                className="text-primary drop-shadow-lg"
                decorative 
              />
            </motion.div>
            
            {/* Title */}
            <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2">
              {title}
            </h3>
            
            {/* Amount */}
            <div className="space-y-1">
              <motion.p 
                className="text-2xl font-bold text-foreground tabular-nums"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                ${current.toLocaleString()}
              </motion.p>
              <p className="text-sm text-muted-foreground">
                of ${target.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Progress Ring */}
          <motion.div
            whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
            className="relative"
          >
            <ProgressRing progress={progress} size={80} strokeWidth={6} />
            
            {/* Sparkle effect when near completion */}
            {isNearCompletion && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={!prefersReducedMotion ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                } : undefined}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ 
                duration: 1, 
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
            {isNearCompletion && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold text-primary"
              >
                Almost there! 🎉
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ambient particles for near-completion goals */}
      {isNearCompletion && (
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"
          animate={!prefersReducedMotion ? {
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          } : undefined}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </GlassCard>
  );
};
