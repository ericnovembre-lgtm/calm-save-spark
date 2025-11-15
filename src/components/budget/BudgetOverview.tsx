import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";
import { SpendingChartAnimated } from "./SpendingChartAnimated";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  budgets: any[];
  spending: Record<string, any>;
  categories: any[];
}

export function BudgetOverview({
  totalBudget,
  totalSpent,
  budgets,
  spending,
  categories
}: BudgetOverviewProps) {
  const remaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const summaryCards = [
    {
      title: "Total Budget",
      value: totalBudget,
      icon: DollarSign,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      subtitle: `Across ${budgets.length} budget${budgets.length !== 1 ? 's' : ''}`
    },
    {
      title: "Total Spent",
      value: totalSpent,
      icon: overallProgress > 100 ? AlertCircle : TrendingUp,
      iconColor: overallProgress > 100 ? "text-destructive" : "text-blue-600",
      iconBg: overallProgress > 100 ? "bg-destructive/10" : "bg-blue-600/10",
      subtitle: `${overallProgress.toFixed(0)}% of budget`,
      progress: Math.min(overallProgress, 100),
      progressColor: overallProgress >= 100 ? "bg-destructive" : overallProgress >= 80 ? "bg-warning" : "bg-primary"
    },
    {
      title: "Remaining",
      value: Math.abs(remaining),
      icon: TrendingDown,
      iconColor: remaining < 0 ? "text-destructive" : "text-primary",
      iconBg: remaining < 0 ? "bg-destructive/10" : "bg-primary/10",
      subtitle: remaining < 0 ? "Over budget" : "Available to spend"
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div key={card.title} variants={fadeInUp} custom={index}>
            <Card className="p-6 hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-foreground">$</span>
                <AnimatedCounter
                  value={card.value}
                  className="text-3xl font-bold text-foreground"
                  decimals={0}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              
              {card.progress !== undefined && (
                <div className="mt-4">
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${card.progressColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Spending Breakdown Chart */}
      {budgets.length > 0 && (
        <motion.div variants={fadeInUp}>
          <SpendingChartAnimated
            budgets={budgets}
            spending={spending}
            categories={categories}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
