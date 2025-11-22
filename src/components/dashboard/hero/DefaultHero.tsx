import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function DefaultHero() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const motivationalMessages = [
    "Every small step builds your financial future",
    "Your journey to financial freedom starts today",
    "Smart saving today, secure tomorrow",
    "Building wealth, one decision at a time"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <motion.div
      className="relative p-8 rounded-2xl border border-primary/30 backdrop-blur-xl bg-gradient-to-br from-primary/10 via-accent/5 to-background/50 overflow-hidden"
    >
      {/* Subtle animated background */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? {
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
              <p className="text-sm text-muted-foreground">
                {randomMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 text-center"
          >
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Track Progress</p>
            <p className="text-lg font-bold text-foreground mt-1">Your Goals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 text-center"
          >
            <Target className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Smart Insights</p>
            <p className="text-lg font-bold text-foreground mt-1">AI Powered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 text-center"
          >
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Gamified</p>
            <p className="text-lg font-bold text-foreground mt-1">Earn Rewards</p>
          </motion.div>
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Button
            onClick={() => navigate('/goals')}
            className="flex-1 font-semibold group"
          >
            Set a Goal
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/budget')}
            className="flex-1"
          >
            Create Budget
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
