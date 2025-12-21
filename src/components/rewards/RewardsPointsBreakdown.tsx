import { Card } from "@/components/ui/card";
import { Target, Sparkles, Flame, CreditCard, Gift, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface PointsCategory {
  label: string;
  points: number;
  icon: LucideIcon;
  color: string;
}

const pointsCategories: PointsCategory[] = [
  { label: "Base Savings", points: 4200, icon: Target, color: "text-primary" },
  { label: "Achievements", points: 3150, icon: Sparkles, color: "text-accent" },
  { label: "Streak Bonus", points: 2400, icon: Flame, color: "text-orange-500" },
  { label: "Card Rewards", points: 1800, icon: CreditCard, color: "text-blue-500" },
  { label: "Referrals", points: 600, icon: Users, color: "text-green-500" },
  { label: "Special Events", points: 300, icon: Gift, color: "text-pink-500" },
];

export function RewardsPointsBreakdown() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Points Breakdown</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pointsCategories.map((category, index) => {
          const Icon = category.icon;
          
          return (
            <motion.div
              key={category.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Card className="p-4 bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50 ${category.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{category.label}</p>
                    <p className="text-lg font-bold text-foreground">
                      {category.points.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
