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
      className="mb-8"
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isAnalyzing ? 360 : 0 }}
              transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">AI Command Center</h2>
              <p className="text-sm text-muted-foreground">Real-time financial intelligence</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-right"
          >
            <div className="text-3xl font-bold text-primary">{healthScore}%</div>
            <div className="text-xs text-muted-foreground">Financial Health</div>
          </motion.div>
        </div>

        <div className="space-y-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-background/50"
            >
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{insight}</span>
            </motion.div>
          ))}
        </div>

        {isAnalyzing && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Analyzing financial patterns...
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
