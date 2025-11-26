import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Heart, CreditCard, PiggyBank, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialHealthMetrics } from "@/hooks/useFinancialHealthMetrics";
import { MetricProgressBar } from "./MetricProgressBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FinancialHealthWidget() {
  const prefersReducedMotion = useReducedMotion();
  const { data: metrics, isLoading } = useFinancialHealthMetrics();

  if (isLoading) {
    return (
      <Card className="border-2 p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-32 mx-auto rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </Card>
    );
  }

  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'hsl(var(--chart-2))' };
    if (score >= 60) return { label: 'Good', color: 'hsl(var(--chart-3))' };
    if (score >= 40) return { label: 'Fair', color: 'hsl(var(--chart-4))' };
    return { label: 'Needs Work', color: 'hsl(var(--chart-5))' };
  };

  const rating = getScoreRating(metrics?.compositeScore || 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = ((metrics?.compositeScore || 0) / 100) * circumference;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <Card className="border-2 p-6 space-y-6 bg-gradient-to-br from-background via-background to-accent/5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Financial Health Score</h3>
              <p className="text-sm text-muted-foreground">Comprehensive wellness metric</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-2xl font-bold text-primary">{metrics?.compositeScore}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Central Gauge */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90" width="128" height="128">
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={rating.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={rating.color} stopOpacity={1} />
                </linearGradient>
              </defs>
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: rating.color }}>
                {metrics?.compositeScore}
              </span>
              <span className="text-xs text-muted-foreground">{rating.label}</span>
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Component Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Credit Score */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 border border-chart-2/20 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-chart-2" />
                      <span className="font-semibold text-sm">Credit Score</span>
                      <AlertCircle className="w-3 h-3 text-muted-foreground ml-auto" />
                    </div>
                    <div className="text-2xl font-bold">{metrics?.creditScore} pts</div>
                    <MetricProgressBar
                      value={metrics?.creditScoreNormalized || 0}
                      label="Rating"
                      color="hsl(var(--chart-2))"
                    />
                    <div className="text-xs text-muted-foreground">
                      {metrics?.creditScoreNormalized >= 80 ? 'Excellent' :
                       metrics?.creditScoreNormalized >= 60 ? 'Good' : 'Fair'}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Your FICO credit score. Higher is better (300-850 range).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Savings Rate */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/5 border border-chart-3/20 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-chart-3" />
                      <span className="font-semibold text-sm">Savings Rate</span>
                      <AlertCircle className="w-3 h-3 text-muted-foreground ml-auto" />
                    </div>
                    <div className="text-2xl font-bold">{metrics?.savingsRate}%</div>
                    <MetricProgressBar
                      value={metrics?.savingsRate || 0}
                      max={30}
                      label="Target 20%+"
                      color="hsl(var(--chart-3))"
                    />
                    <div className="text-xs text-muted-foreground">
                      {metrics?.savingsRate >= 20 ? 'Excellent' :
                       metrics?.savingsRate >= 10 ? 'Good' : 'Needs improvement'}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Percentage of income saved after expenses. Aim for 20%+.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Debt-to-Income */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/5 border border-chart-4/20 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-chart-4" />
                      <span className="font-semibold text-sm">Debt-to-Income</span>
                      <AlertCircle className="w-3 h-3 text-muted-foreground ml-auto" />
                    </div>
                    <div className="text-2xl font-bold">{metrics?.debtToIncomeRatio}%</div>
                    <MetricProgressBar
                      value={Math.max(100 - (metrics?.debtToIncomeRatio || 0) * 2, 0)}
                      label="Health"
                      color="hsl(var(--chart-4))"
                    />
                    <div className="text-xs text-muted-foreground">
                      {metrics?.debtToIncomeRatio < 36 ? 'Healthy' :
                       metrics?.debtToIncomeRatio < 50 ? 'Manageable' : 'High'}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Monthly debt payments vs income. Keep below 36%.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
          <span>Updated 2 hours ago</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending positive
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
