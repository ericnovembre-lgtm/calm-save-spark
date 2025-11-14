import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PredictiveAnalyticsProps {
  currentSavingsRate: number; // monthly amount
  goalAmount: number;
  currentAmount: number;
  className?: string;
}

export function PredictiveAnalytics({
  currentSavingsRate,
  goalAmount,
  currentAmount,
  className = ""
}: PredictiveAnalyticsProps) {
  const [adjustedRate, setAdjustedRate] = useState(currentSavingsRate);
  const prefersReducedMotion = useReducedMotion();

  // Calculate projections
  const remaining = goalAmount - currentAmount;
  const baseMonthsToGoal = Math.ceil(remaining / currentSavingsRate);
  const adjustedMonthsToGoal = Math.ceil(remaining / adjustedRate);
  const monthsSaved = baseMonthsToGoal - adjustedMonthsToGoal;

  // Calculate completion dates
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + baseMonthsToGoal);
  
  const adjustedDate = new Date();
  adjustedDate.setMonth(adjustedDate.getMonth() + adjustedMonthsToGoal);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <GlassCard className={`p-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">What If Analysis</h3>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm text-muted-foreground">
              Adjust monthly savings
            </label>
            <motion.div
              className="text-2xl font-bold text-foreground tabular-nums"
              key={adjustedRate}
              initial={prefersReducedMotion ? false : { scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              $
              <AnimatedCounter 
                value={adjustedRate} 
                decimals={0}
                className="inline"
              />
            </motion.div>
          </div>

          <Slider
            value={[adjustedRate]}
            onValueChange={([value]) => setAdjustedRate(value)}
            min={50}
            max={Math.max(currentSavingsRate * 3, 1000)}
            step={25}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>$50/mo</span>
            <span>${Math.max(currentSavingsRate * 3, 1000)}/mo</span>
          </div>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current projection */}
          <motion.div
            className="p-4 rounded-xl bg-muted/30 border border-border/50"
            layout
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Current Rate
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-xl font-bold text-foreground">
                  {formatDate(baseDate)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Time to goal</div>
                <div className="text-lg font-semibold text-foreground">
                  {baseMonthsToGoal} months
                </div>
              </div>
            </div>
          </motion.div>

          {/* Adjusted projection */}
          <motion.div
            className={`p-4 rounded-xl border ${
              adjustedRate > currentSavingsRate
                ? "bg-success/10 border-success/30"
                : adjustedRate < currentSavingsRate
                ? "bg-warning/10 border-warning/30"
                : "bg-muted/30 border-border/50"
            }`}
            layout
            animate={!prefersReducedMotion && adjustedRate !== currentSavingsRate ? {
              scale: [1, 1.02, 1]
            } : undefined}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">
                Adjusted Rate
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-xl font-bold text-foreground">
                  {formatDate(adjustedDate)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Time to goal</div>
                <div className="text-lg font-semibold text-foreground">
                  {adjustedMonthsToGoal} months
                  {monthsSaved !== 0 && (
                    <motion.span
                      className={`ml-2 text-sm ${
                        monthsSaved > 0 ? "text-success" : "text-warning"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      ({monthsSaved > 0 ? "-" : "+"}{Math.abs(monthsSaved)} mo)
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Impact summary */}
        {adjustedRate !== currentSavingsRate && (
          <motion.div
            className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm text-foreground">
              {adjustedRate > currentSavingsRate ? (
                <>
                  💪 By increasing your savings by{" "}
                  <span className="font-bold">
                    ${adjustedRate - currentSavingsRate}
                  </span>
                  /month, you'll reach your goal{" "}
                  <span className="font-bold">{Math.abs(monthsSaved)} months earlier</span>!
                </>
              ) : (
                <>
                  ⚠️ Reducing your savings by{" "}
                  <span className="font-bold">
                    ${currentSavingsRate - adjustedRate}
                  </span>
                  /month will delay your goal by{" "}
                  <span className="font-bold">{Math.abs(monthsSaved)} months</span>.
                </>
              )}
            </p>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  );
}
