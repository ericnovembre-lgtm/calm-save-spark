import { motion } from "framer-motion";
import { Target, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGoalOptimization } from "@/hooks/useGoalOptimization";

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-accent",
  critical: "text-destructive"
};

const priorityBgColors = {
  low: "bg-muted",
  medium: "bg-primary/10",
  high: "bg-accent/10",
  critical: "bg-destructive/10"
};

export function GoalOptimizer() {
  const { data, isLoading, error } = useGoalOptimization();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">Unable to Optimize</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || 'No goals found to optimize'}
        </p>
      </Card>
    );
  }

  const { optimizations, recommendations, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Goal Optimization</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered allocation strategy for your {summary.totalGoals} goals
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Monthly Available</div>
          <div className="text-2xl font-bold text-primary">
            ${summary.monthlyDisposable.toFixed(0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Allocation</div>
          <div className="text-2xl font-bold text-accent">
            ${summary.totalMonthlyAllocation.toFixed(0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Completion</div>
          <div className="text-2xl font-bold">
            {summary.averageCompletionTime} mo
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            Strategic Recommendations
          </h3>
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 border-l-4 ${priorityBgColors[rec.priority]}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${priorityColors[rec.priority]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Action:</span>
                        <span className="font-medium">{rec.action}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="font-medium">{rec.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Goal Optimizations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Optimized Allocations
        </h3>
        {optimizations.map((opt, index) => {
          const progress = (opt.currentAmount / opt.targetAmount) * 100;
          
          return (
            <motion.div
              key={opt.goalId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{opt.goalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${opt.currentAmount.toFixed(0)} of ${opt.targetAmount.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={opt.onTrack ? "default" : "destructive"} className="mb-1">
                      {opt.onTrack ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {opt.onTrack ? 'On Track' : 'Behind'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Priority: {opt.priorityScore.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Progress value={progress} className="mb-4" />

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Monthly</div>
                    <div className="font-bold text-lg text-primary">
                      ${opt.suggestedMonthlyAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Weekly</div>
                    <div className="font-bold text-lg text-accent">
                      ${opt.suggestedWeeklyAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Complete By</div>
                    <div className="font-bold text-sm">
                      {new Date(opt.estimatedCompletion).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
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