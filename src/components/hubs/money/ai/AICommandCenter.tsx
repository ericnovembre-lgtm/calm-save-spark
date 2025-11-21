import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AICommandCenter() {
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate AI analysis with progressive score animation
    const timer = setTimeout(() => {
      let current = 0;
      const target = 87;
      const increment = () => {
        if (current < target) {
          current += 1;
          setHealthScore(current);
          setTimeout(increment, 20);
        } else {
          setIsAnalyzing(false);
        }
      };
      increment();
      
      setInsights([
        "Your spending is 12% lower than last month",
        "Budget optimization could save $240/month",
        "3 subscriptions detected that you rarely use",
        "Emergency fund is 85% complete",
        "Debt payoff ahead of schedule by 2 months",
        "Investment recommendations available"
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/30 backdrop-blur-sm overflow-hidden relative">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, hsl(var(--primary)) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: isAnalyzing ? 360 : 0,
                  scale: isAnalyzing ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" },
                  scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0 }
                }}
                className="relative"
              >
                <Brain className="w-6 h-6 text-primary" />
                {isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  AI Financial Intelligence
                  {!isAnalyzing && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAnalyzing ? "Analyzing patterns..." : "Real-time insights"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{healthScore}</div>
                <div className="text-[10px] text-muted-foreground">Health Score</div>
              </motion.div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {insights.slice(0, isExpanded ? insights.length : 3).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-tight flex-1">{insight}</span>
                <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5 opacity-60" />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex gap-1"
                >
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full" />
                </motion.div>
                Processing financial data...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
