import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CountUp from "react-countup";

interface RewardsHeroCardProps {
  totalPoints: number;
  tier: string;
  tierProgress: number;
  pointsToNextTier: number;
  nextTier: string;
  monthlyPoints?: number;
  multiplier?: number;
  streakDays?: number;
}

const tierConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  basic: { color: "text-muted-foreground", bgColor: "bg-muted", icon: "🌱" },
  growth: { color: "text-accent", bgColor: "bg-accent/20", icon: "🌿" },
  prestige: { color: "text-primary", bgColor: "bg-primary/20", icon: "⭐" },
  elite: { color: "text-amber-500", bgColor: "bg-amber-500/20", icon: "👑" },
  "elite legacy": { color: "text-amber-500", bgColor: "bg-amber-500/20", icon: "👑" },
  legend: { color: "text-purple-500", bgColor: "bg-purple-500/20", icon: "💎" },
};

export function RewardsHeroCard({
  totalPoints,
  tier,
  tierProgress,
  pointsToNextTier,
  nextTier,
  monthlyPoints = 0,
  multiplier = 1.0,
  streakDays = 0,
}: RewardsHeroCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = tierConfig[tier.toLowerCase()] || tierConfig.basic;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-card via-card to-accent/10 border-2 border-accent/20 rounded-3xl shadow-2xl">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header with tier badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Available Points</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-foreground tracking-tight">
                  <CountUp
                    end={totalPoints}
                    duration={1.5}
                    separator=","
                    preserveValue
                  />
                </span>
                <span className="text-lg text-muted-foreground">pts</span>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`${config.bgColor} ${config.color} border-current/30 px-4 py-2 text-sm font-semibold gap-2`}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{tier}</span>
            </Badge>
          </div>

          {/* Tier progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Progress to {nextTier}</span>
              </div>
              <span className="text-foreground font-medium">
                {pointsToNextTier.toLocaleString()} pts away
              </span>
            </div>

            <div className="relative">
              <Progress 
                value={tierProgress} 
                className="h-3 bg-muted/50"
              />
              {/* Animated glow on progress bar */}
              {!prefersReducedMotion && tierProgress > 0 && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                  style={{ width: `${tierProgress}%` }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 3,
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{tier}</span>
              <span className="capitalize">{nextTier}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                <CountUp end={monthlyPoints} duration={1.2} preserveValue />
              </p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {multiplier}x
              </p>
              <p className="text-xs text-muted-foreground">Multiplier</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                <CountUp end={streakDays} duration={1} preserveValue />
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
