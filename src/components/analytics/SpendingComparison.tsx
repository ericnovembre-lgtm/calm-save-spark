import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyData {
  month: string;
  spending: number;
}

interface SpendingComparisonProps {
  monthlyData: MonthlyData[];
  isLoading?: boolean;
}

export function SpendingComparison({ monthlyData, isLoading }: SpendingComparisonProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </Card>
    );
  }

  // Get last 3 months for comparison
  const recentMonths = monthlyData.slice(-3).reverse();

  if (recentMonths.length < 2) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Month-over-Month</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Need more data to show month comparisons
          </p>
        </div>
      </Card>
    );
  }

  const maxSpending = Math.max(...recentMonths.map(m => m.spending));

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6 text-foreground">Month-over-Month Comparison</h3>
        <div className="space-y-6">
          {recentMonths.map((monthData, index) => {
            const previousMonth = recentMonths[index + 1];
            const change = previousMonth 
              ? getChange(monthData.spending, previousMonth.spending)
              : 0;
            const isIncrease = change > 0;
            const isDecrease = change < 0;
            const progressValue = maxSpending > 0 
              ? (monthData.spending / maxSpending) * 100 
              : 0;

            return (
              <motion.div
                key={monthData.month}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">
                      {formatMonth(monthData.month)}
                    </span>
                    {index === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">
                      ${monthData.spending.toFixed(0)}
                    </span>
                    {previousMonth && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                          isIncrease && "bg-red-500/10 text-red-600",
                          isDecrease && "bg-green-500/10 text-green-600",
                          !isIncrease && !isDecrease && "bg-muted text-muted-foreground"
                        )}
                      >
                        {isIncrease && <ArrowUp className="w-3 h-3" />}
                        {isDecrease && <ArrowDown className="w-3 h-3" />}
                        {!isIncrease && !isDecrease && <Minus className="w-3 h-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <Progress 
                  value={progressValue} 
                  className="h-2"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        {recentMonths.length >= 2 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Monthly</span>
              <span className="font-semibold text-foreground">
                ${(recentMonths.reduce((sum, m) => sum + m.spending, 0) / recentMonths.length).toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
