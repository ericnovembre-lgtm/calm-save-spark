import { motion } from "framer-motion";
import { Target, Sparkles, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import confetti from "canvas-confetti";

interface GoalNearHeroProps {
  data: {
    goal: {
      id: string;
      name: string;
      current: number;
      target: number;
      percentageComplete: number;
      remainingAmount: number;
      icon?: string;
    };
    suggestedNextGoal?: {
      name: string;
      suggestedTarget: number;
    };
  };
}

export function GoalNearHero({ data }: GoalNearHeroProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleCelebrate = () => {
    if (!prefersReducedMotion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['hsl(var(--primary))', 'hsl(var(--accent))', '#FFD700']
      });
    }
    navigate(`/goals`);
  };

  return (
    <motion.div
      className="relative p-8 rounded-2xl border border-primary/40 backdrop-blur-xl bg-gradient-to-br from-primary/15 via-accent/10 to-background/50 overflow-hidden"
      animate={!prefersReducedMotion ? {
        boxShadow: [
          "0 0 30px hsl(var(--primary) / 0.3)",
          "0 0 50px hsl(var(--primary) / 0.5)",
          "0 0 30px hsl(var(--primary) / 0.3)"
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Celebration sparkles */}
      {!prefersReducedMotion && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + Math.sin(i * 2) * 30}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ))}
        </>
      )}

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? {
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1.2, 1.2, 1],
              } : {}}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <PartyPopper className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Almost There! 🎯</h2>
              <p className="text-sm text-muted-foreground">
                You're so close to completing your goal
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
            <span className="text-2xl font-bold text-primary">
              {data.goal.percentageComplete.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Goal progress */}
        <div className="p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.goal.icon && <span className="text-3xl">{data.goal.icon}</span>}
              <div>
                <p className="font-bold text-xl text-foreground">{data.goal.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${data.goal.current.toLocaleString()} of ${data.goal.target.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-primary">
                ${data.goal.remainingAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${data.goal.percentageComplete}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Next goal suggestion */}
        {data.suggestedNextGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-accent/10 border border-accent/30 backdrop-blur-sm"
          >
            <p className="text-sm text-muted-foreground mb-1">Up Next:</p>
            <p className="font-semibold text-foreground">
              {data.suggestedNextGoal.name}
              <span className="text-muted-foreground ml-2">
                (${data.suggestedNextGoal.suggestedTarget.toLocaleString()})
              </span>
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCelebrate}
            className="flex-1 font-semibold group"
          >
            <Target className="mr-2 w-4 h-4" />
            Complete Goal
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/goals')}
          >
            View All Goals
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
