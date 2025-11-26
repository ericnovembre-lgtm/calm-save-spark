import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePredictiveHealth } from "@/hooks/usePredictiveHealth";
import { Progress } from "@/components/ui/progress";

export function PredictiveHealthScore() {
  const { 
    prediction, 
    isLoading, 
    refetch,
    getScoreColor,
    getScoreLabel,
    getTrendIcon 
  } = usePredictiveHealth();

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Health Data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Not enough financial history to predict health scores
        </p>
        <Button onClick={() => refetch()}>
          Analyze Now
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Health Score Forecast</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered 90-day prediction
          </p>
        </div>
      </div>

      {/* Current Score Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(prediction.current_score)}`}>
                {prediction.current_score}
              </span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <p className="text-sm font-medium mt-1">
              {getScoreLabel(prediction.current_score)}
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {prediction.current_score > prediction.predicted_90d ? '📉' : '📈'}
          </Badge>
        </div>
        <Progress value={prediction.current_score} className="h-2" />
      </Card>

      {/* Predictions Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">30-Day Forecast</p>
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getScoreColor(prediction.predicted_30d)}`}>
              {prediction.predicted_30d}
            </span>
            <span className={`text-sm ${
              prediction.predicted_30d > prediction.current_score 
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              {prediction.predicted_30d > prediction.current_score ? '+' : ''}
              {(prediction.predicted_30d - prediction.current_score).toFixed(0)}
            </span>
          </div>
          <Progress value={prediction.predicted_30d} className="h-1 mt-3" />
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">60-Day Forecast</p>
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getScoreColor(prediction.predicted_60d)}`}>
              {prediction.predicted_60d}
            </span>
            <span className={`text-sm ${
              prediction.predicted_60d > prediction.current_score 
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              {prediction.predicted_60d > prediction.current_score ? '+' : ''}
              {(prediction.predicted_60d - prediction.current_score).toFixed(0)}
            </span>
          </div>
          <Progress value={prediction.predicted_60d} className="h-1 mt-3" />
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">90-Day Forecast</p>
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getScoreColor(prediction.predicted_90d)}`}>
              {prediction.predicted_90d}
            </span>
            <span className={`text-sm ${
              prediction.predicted_90d > prediction.current_score 
                ? 'text-success' 
                : 'text-destructive'
            }`}>
              {prediction.predicted_90d > prediction.current_score ? '+' : ''}
              {(prediction.predicted_90d - prediction.current_score).toFixed(0)}
            </span>
          </div>
          <Progress value={prediction.predicted_90d} className="h-1 mt-3" />
        </Card>
      </div>

      {/* Factors */}
      {prediction.factors && prediction.factors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Impact Factors
          </h3>
          <div className="space-y-3">
            {prediction.factors.map((factor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-2xl">{getTrendIcon(factor.trend)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">
                      {factor.factor.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className={
                      factor.impact > 0 ? 'text-success' : 'text-destructive'
                    }>
                      {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(0)} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {prediction.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Badge className={
                  rec.priority === 'high' ? 'bg-destructive' :
                  rec.priority === 'medium' ? 'bg-warning' :
                  'bg-muted'
                }>
                  {rec.priority}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">{rec.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Impact: +{rec.impact_score} points
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
