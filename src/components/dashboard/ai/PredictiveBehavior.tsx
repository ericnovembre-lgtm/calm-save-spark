import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, Clock, TrendingUp, Zap } from 'lucide-react';

interface Prediction {
  action: string;
  confidence: number;
  timing: string;
  icon: typeof Clock;
}

export function PredictiveBehavior() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    { action: 'Check vacation goal', confidence: 0.92, timing: 'in 2 hours', icon: TrendingUp },
    { action: 'Transfer to savings', confidence: 0.85, timing: 'on Friday', icon: Zap },
    { action: 'Review spending', confidence: 0.78, timing: 'this evening', icon: Clock }
  ]);

  const [learningData, setLearningData] = useState({
    interactions: 1247,
    accuracy: 87,
    patterns: 23
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLearningData(prev => ({
        ...prev,
        interactions: prev.interactions + Math.floor(Math.random() * 5),
        accuracy: Math.min(prev.accuracy + (Math.random() > 0.5 ? 0.1 : 0), 95)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl relative">
          <Brain className="w-6 h-6 text-primary" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-2xl"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Predictive Behavior</h3>
          <p className="text-sm text-muted-foreground">ML-powered action forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-accent/50 rounded-2xl p-4 text-center">
          <motion.p
            key={learningData.interactions}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            {learningData.interactions}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Interactions</p>
        </div>
        <div className="bg-accent/50 rounded-2xl p-4 text-center">
          <motion.p
            key={learningData.accuracy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-green-500"
          >
            {learningData.accuracy.toFixed(1)}%
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
        </div>
        <div className="bg-accent/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{learningData.patterns}</p>
          <p className="text-xs text-muted-foreground mt-1">Patterns</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Predicted Actions</p>
        {predictions.map((pred, i) => {
          const Icon = pred.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-r from-accent/50 to-transparent border border-border rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{pred.action}</p>
                  <p className="text-sm text-muted-foreground">{pred.timing}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pred.confidence * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {(pred.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center"
      >
        <p className="text-sm text-foreground">
          <span className="font-semibold">AI is learning...</span> Accuracy improves with each interaction
        </p>
      </motion.div>
    </motion.div>
  );
}
