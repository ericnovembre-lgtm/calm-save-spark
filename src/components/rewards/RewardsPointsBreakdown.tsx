import { Card } from "@/components/ui/card";
import { Target, Sparkles, Flame, CreditCard, Gift, Users, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface PointsCategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

const categoryConfig: Record<string, PointsCategoryConfig> = {
  base: { label: "Base Savings", icon: Target, color: "text-primary" },
  achievement: { label: "Achievements", icon: Sparkles, color: "text-accent" },
  streak: { label: "Streak Bonus", icon: Flame, color: "text-orange-500" },
  category_bonus: { label: "Category Bonus", icon: Zap, color: "text-yellow-500" },
  card: { label: "Card Rewards", icon: CreditCard, color: "text-blue-500" },
  referral: { label: "Referrals", icon: Users, color: "text-green-500" },
  bonus: { label: "Special Events", icon: Gift, color: "text-pink-500" },
  tier_bonus: { label: "Tier Bonus", icon: Award, color: "text-purple-500" },
  signup_bonus: { label: "Signup Bonus", icon: Gift, color: "text-emerald-500" },
};

interface RewardsPointsBreakdownProps {
  pointsByType: Record<string, number>;
}

export function RewardsPointsBreakdown({ pointsByType }: RewardsPointsBreakdownProps) {
  const prefersReducedMotion = useReducedMotion();

  // Convert pointsByType to display categories
  const categories = Object.entries(pointsByType)
    .filter(([_, points]) => points > 0)
    .map(([type, points]) => {
      const config = categoryConfig[type] || { 
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '), 
        icon: Gift, 
        color: "text-muted-foreground" 
      };
      return { type, points, ...config };
    })
    .sort((a, b) => b.points - a.points);

  // If no points yet, show placeholder categories
  const displayCategories = categories.length > 0 ? categories : [
    { type: 'base', points: 0, ...categoryConfig.base },
    { type: 'achievement', points: 0, ...categoryConfig.achievement },
    { type: 'streak', points: 0, ...categoryConfig.streak },
    { type: 'referral', points: 0, ...categoryConfig.referral },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Points Breakdown</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayCategories.slice(0, 6).map((category, index) => {
          const Icon = category.icon;
          
          return (
            <motion.div
              key={category.type}
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
