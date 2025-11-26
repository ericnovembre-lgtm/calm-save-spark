import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePredictiveHealth } from '@/hooks/usePredictiveHealth';
import { Activity, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function PredictiveHealthScore() {
  const { prediction, isLoading, refetch, getScoreColor, getScoreLabel, getTrendIcon } =
    usePredictiveHealth();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Unable to calculate health score</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const getTrendArrow = (current: number, predicted: number) => {
    if (predicted > current + 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (predicted < current - 2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Financial Health Score</h3>
          <p className="text-sm text-muted-foreground">Predictive intelligence analysis</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Score */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="text-center mb-4">
          <div className={`text-6xl font-bold ${getScoreColor(prediction.current_score)}`}>
            {prediction.current_score}
          </div>
          <div className="text-lg text-muted-foreground mt-1">
            {getScoreLabel(prediction.current_score)}
          </div>
        </div>
        <Progress value={prediction.current_score} className="h-3" />
      </motion.div>

      {/* Predictions */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-sm">Predicted Trajectory</h4>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">30 Days</span>
              {getTrendArrow(prediction.current_score, prediction.predicted_30d)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(prediction.predicted_30d)}`}>
              {prediction.predicted_30d}
            </div>
          </Card>
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">60 Days</span>
              {getTrendArrow(prediction.current_score, prediction.predicted_60d)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(prediction.predicted_60d)}`}>
              {prediction.predicted_60d}
            </div>
          </Card>
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">90 Days</span>
              {getTrendArrow(prediction.current_score, prediction.predicted_90d)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(prediction.predicted_90d)}`}>
              {prediction.predicted_90d}
            </div>
          </Card>
        </div>
      </div>

      {/* Impact Factors */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-sm">Impact Factors</h4>
        {prediction.factors.map((factor, index) => (
          <motion.div
            key={factor.factor}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-3 bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <span className="text-lg">{getTrendIcon(factor.trend)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {factor.impact > 0 ? '+' : ''}
                    {factor.impact.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">impact</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recommended Actions</h4>
          {prediction.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-3 ${
                  rec.priority === 'high'
                    ? 'border-red-200 bg-red-50 dark:bg-red-950/20'
                    : rec.priority === 'medium'
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Potential impact: +{rec.impact_score} points
                    </p>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {rec.priority}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}