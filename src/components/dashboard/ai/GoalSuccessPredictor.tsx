import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface GoalPrediction {
  goalName: string;
  target: number;
  current: number;
  successProbability: number;
  factors: { name: string; impact: number }[];
  suggestions: string[];
}

export function GoalSuccessPredictor() {
  const [prediction] = useState<GoalPrediction>({
    goalName: 'Vacation Fund',
    target: 5000,
    current: 2250,
    successProbability: 0.78,
    factors: [
      { name: 'Current savings rate', impact: 0.4 },
      { name: 'Historical consistency', impact: 0.3 },
      { name: 'Time remaining', impact: 0.2 },
      { name: 'Income stability', impact: 0.1 }
    ],
    suggestions: [
      'Increase monthly contribution by $50 to reach 95% success rate',
      'Your consistency is excellent - keep it up!',
      'Consider setting up automation for guaranteed success'
    ]
  });

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.8) return 'text-green-500';
    if (prob >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProbabilityBg = (prob: number) => {
    if (prob >= 0.8) return 'bg-green-500/10 border-green-500/20';
    if (prob >= 0.6) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Success Predictor</h3>
          <p className="text-sm text-muted-foreground">ML-powered goal analysis</p>
        </div>
      </div>

      <div className={`border rounded-3xl p-6 mb-6 ${getProbabilityBg(prediction.successProbability)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{prediction.goalName}</p>
            <p className="text-3xl font-bold text-foreground">
              ${prediction.current.toLocaleString()} / ${prediction.target.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`text-5xl font-bold ${getProbabilityColor(prediction.successProbability)}`}
            >
              {(prediction.successProbability * 100).toFixed(0)}%
            </motion.p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(prediction.current / prediction.target) * 100}%` }}
            className="h-full bg-primary"
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Contributing Factors</p>
        {prediction.factors.map((factor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">{factor.name}</span>
              <span className="font-medium text-primary">+{(factor.impact * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factor.impact * 100}%` }}
                className="h-full bg-primary"
                transition={{ delay: i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          <Lightbulb className="w-4 h-4" />
          <span>AI Suggestions</span>
        </div>
        {prediction.suggestions.map((suggestion, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 bg-accent/50 rounded-xl"
          >
            <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{suggestion}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
