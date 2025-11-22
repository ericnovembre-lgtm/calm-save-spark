import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface OverspendingHeroProps {
  data: {
    budget: {
      name: string;
      spent: number;
      limit: number;
      percentageUsed: number;
    };
    topCategories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
  };
  urgency: 'critical' | 'warning' | 'info';
}

export function OverspendingHero({ data, urgency }: OverspendingHeroProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const urgencyColors = {
    critical: 'from-destructive/20 to-destructive/5 border-destructive/40',
    warning: 'from-orange-500/20 to-orange-500/5 border-orange-500/40',
    info: 'from-primary/20 to-primary/5 border-primary/40',
  };

  const urgencyTextColors = {
    critical: 'text-destructive',
    warning: 'text-orange-500',
    info: 'text-primary',
  };

  return (
    <motion.div
      className={cn(
        "relative p-8 rounded-2xl border backdrop-blur-xl bg-gradient-to-br overflow-hidden",
        urgencyColors[urgency]
      )}
    >
      {/* Warning pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? {
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.5, repeat: urgency === 'critical' ? Infinity : 0, repeatDelay: 1 }}
            >
              <AlertTriangle className={cn("w-8 h-8", urgencyTextColors[urgency])} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Budget Alert</h2>
              <p className="text-sm text-muted-foreground">
                You're approaching your spending limit
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", urgencyTextColors[urgency])}>
              {data.budget.percentageUsed.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">of budget used</p>
          </div>
        </div>

        {/* Budget breakdown */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-foreground">{data.budget.name}</p>
              <p className="text-sm text-muted-foreground">
                ${data.budget.spent.toFixed(2)} / ${data.budget.limit.toFixed(2)}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  data.budget.percentageUsed >= 100 && "bg-destructive",
                  data.budget.percentageUsed >= 90 && data.budget.percentageUsed < 100 && "bg-orange-500",
                  data.budget.percentageUsed < 90 && "bg-primary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(data.budget.percentageUsed, 100)}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* Top spending categories */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Top Spending Categories
            </h3>
            <div className="space-y-2">
              {data.topCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-semibold">
                      ${category.amount.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      ({category.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/budget')}
            className="flex-1 font-semibold group"
          >
            <Target className="mr-2 w-4 h-4" />
            Adjust Budget
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/transactions')}
            className="flex-1"
          >
            View Transactions
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
