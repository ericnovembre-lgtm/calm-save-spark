import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertCircle, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  suggestion?: string;
}

interface FinancialHealthScoreProps {
  overallScore: number;
  categories: ScoreCategory[];
  onViewDetails?: () => void;
  onImprove?: (category: string) => void;
}

export function FinancialHealthScore({
  overallScore,
  categories,
  onViewDetails,
  onImprove,
}: FinancialHealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getStatusIcon = (status: ScoreCategory['status']) => {
    switch (status) {
      case 'excellent':
        return <Award className="w-4 h-4 text-primary" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'fair':
        return <TrendingUp className="w-4 h-4 text-warning" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: ScoreCategory['status']) => {
    switch (status) {
      case 'excellent':
        return 'bg-primary/10 border-primary/30';
      case 'good':
        return 'bg-accent/10 border-accent/30';
      case 'fair':
        return 'bg-warning/10 border-warning/30';
      case 'poor':
        return 'bg-destructive/10 border-destructive/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">
              Financial Health Score
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your overall financial wellness at a glance
            </p>
          </div>
        </div>

        {/* Overall Score Display */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative w-40 h-40"
            >
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                  opacity="0.2"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: overallScore / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeDasharray="440"
                  strokeDashoffset="0"
                />
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={cn('text-4xl font-bold', getScoreColor(overallScore))}
                >
                  {overallScore}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getScoreLabel(overallScore)}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Based on {categories.length} financial factors
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground">
            Score Breakdown
          </h4>
          {categories.map((category, i) => {
            const percentage = (category.score / category.maxScore) * 100;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'p-4 rounded-lg border space-y-3',
                  getStatusColor(category.status)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(category.status)}
                    <div>
                      <div className="text-sm font-medium">{category.name}</div>
                      {category.suggestion && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {category.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {category.score}/{category.maxScore}
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}%</span>
                    {category.status !== 'excellent' && onImprove && (
                      <button
                        onClick={() => onImprove(category.name)}
                        className="text-primary hover:underline font-medium"
                      >
                        Improve
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        {onViewDetails && (
          <Button onClick={onViewDetails} variant="outline" className="w-full">
            View Detailed Report
          </Button>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Quick Tip</div>
              <div className="text-xs text-muted-foreground">
                {overallScore >= 80
                  ? "You're doing great! Focus on maintaining your excellent financial habits."
                  : overallScore >= 60
                  ? "Good progress! Address the areas marked 'Fair' to boost your score."
                  : "Small improvements in each category can significantly boost your overall score."}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
