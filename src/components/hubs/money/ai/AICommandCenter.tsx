import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AICommandCenter() {
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setHealthScore(87);
      setInsights([
        "Your spending is 12% lower than last month",
        "Budget optimization could save $240/month",
        "3 subscriptions detected that you rarely use"
      ]);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isAnalyzing ? 360 : 0 }}
              transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold">AI Insights</h2>
              <p className="text-xs text-muted-foreground">Financial intelligence</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="text-2xl font-bold text-primary">{healthScore}%</div>
          </motion.div>
        </div>

        <div className="mt-3 space-y-1.5">
          {insights.slice(0, 3).map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
            >
              <Sparkles className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs leading-tight">{insight}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
