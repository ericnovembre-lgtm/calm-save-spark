import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function AICommandCenter() {
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 md:mb-6"
    >
      <Card className={cn(
        "overflow-hidden relative",
        "p-3 md:p-4 lg:p-5",
        "bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10",
        "border border-primary/30 backdrop-blur-sm",
        "shadow-lg shadow-primary/5"
      )}>
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
          {/* Header - Better mobile layout */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <motion.div
                animate={{ 
                  rotate: isAnalyzing ? 360 : 0,
                  scale: isAnalyzing ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" },
                  scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0, ease: [0.22, 1, 0.36, 1] }
                }}
                className="relative shrink-0"
              >
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
                {isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <h2 className={cn(
                  "font-bold flex items-center gap-2",
                  "text-sm md:text-base lg:text-lg"
                )}>
                  <span className="truncate">AI Financial Intelligence</span>
                  {!isAnalyzing && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-green-500 rounded-full shrink-0"
                    />
                  )}
                </h2>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                  {isAnalyzing ? "Analyzing patterns..." : "Real-time insights"}
                </p>
              </div>
            </div>
            
            {/* Health Score + Expand - Mobile optimized */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: isMobile ? 0 : 0.3, 
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="text-center"
              >
                <motion.div 
                  className="text-xl md:text-2xl lg:text-3xl font-bold text-primary"
                  animate={!isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {healthScore}
                </motion.div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                  Score
                </div>
              </motion.div>
              
              <Button
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse insights" : "Expand insights"}
                aria-expanded={isExpanded}
                className={cn(
                  "shrink-0",
                  isMobile ? "h-10 w-10 p-0" : "h-8 w-8 p-0"
                )}
              >
                {isExpanded ? (
                  <ChevronUp className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
                ) : (
                  <ChevronDown className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
                )}
              </Button>
            </div>
          </div>

          {/* Insights - Mobile optimized */}
          <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
            {insights.slice(0, isExpanded ? insights.length : (isMobile ? 2 : 3)).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: isMobile ? 0 : (0.3 + i * 0.1),
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  x: 4, 
                  scale: 1.01,
                  boxShadow: "0 4px 12px -2px hsl(var(--primary) / 0.1)",
                  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                }}
                className={cn(
                  "flex items-start gap-2 rounded-lg",
                  "bg-background/60 backdrop-blur-sm",
                  "hover:bg-background/80 transition-all duration-300 cursor-pointer",
                  "border border-transparent hover:border-primary/20",
                  "p-2 md:p-2.5",
                  "shadow-sm"
                )}
              >
                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary shrink-0 mt-0.5 drop-shadow-sm" />
                <span className="text-xs md:text-sm leading-tight flex-1 font-medium">{insight}</span>
                <TrendingUp className="w-3 h-3 text-green-500 shrink-0 mt-0.5 opacity-60 drop-shadow-sm" />
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
