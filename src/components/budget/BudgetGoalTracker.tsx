import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { fadeInUp } from "@/lib/motion-variants";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";

interface BudgetGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

interface BudgetGoalTrackerProps {
  budgets: any[];
  spending: Record<string, any>;
}

export function BudgetGoalTracker({ budgets, spending }: BudgetGoalTrackerProps) {
  // Generate milestones based on budget performance
  const milestones = budgets.map(budget => {
    const spend = spending[budget.id];
    const spentAmount = spend?.spent_amount || 0;
    const limit = parseFloat(String(budget.total_limit));
    const remaining = limit - spentAmount;
    const percentage = limit > 0 ? (spentAmount / limit) * 100 : 0;

    return {
      id: budget.id,
      title: `Keep ${budget.name} under budget`,
      targetAmount: limit,
      currentAmount: spentAmount,
      remaining,
      percentage: Math.min(percentage, 100),
      status: percentage < 80 ? 'on-track' : percentage < 100 ? 'warning' : 'exceeded',
      deadline: 'End of month'
    };
  });

  const onTrackCount = milestones.filter(m => m.status === 'on-track').length;
  const totalSavings = milestones.reduce((sum, m) => sum + Math.max(m.remaining, 0), 0);

  return (
    <motion.div variants={fadeInUp} className="space-y-4">
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Budget Goals</h3>
            <p className="text-sm text-muted-foreground">
              {onTrackCount} of {milestones.length} on track
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-purple-600/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Potential Savings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">$</span>
              <AnimatedCounter 
                value={totalSavings} 
                className="text-2xl font-bold text-primary"
                decimals={0}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Amount remaining across all budgets this period
          </p>
        </div>

        {/* Individual Milestones */}
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {milestone.status === 'on-track' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  ) : milestone.status === 'warning' ? (
                    <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{milestone.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.deadline}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ${milestone.currentAmount.toFixed(0)} / ${milestone.targetAmount.toFixed(0)}
                  </p>
                  {milestone.remaining > 0 && (
                    <p className="text-xs text-primary">
                      ${milestone.remaining.toFixed(0)} left
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Progress 
                  value={milestone.percentage} 
                  className={`h-2 ${
                    milestone.status === 'exceeded' ? '[&>div]:bg-destructive' :
                    milestone.status === 'warning' ? '[&>div]:bg-orange-500' :
                    ''
                  }`}
                />
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${
                    milestone.status === 'exceeded' ? 'text-destructive' :
                    milestone.status === 'warning' ? 'text-orange-500' :
                    'text-primary'
                  }`}>
                    {milestone.percentage.toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground">
                    {milestone.status === 'on-track' ? 'On track' :
                     milestone.status === 'warning' ? 'Near limit' :
                     'Over budget'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
