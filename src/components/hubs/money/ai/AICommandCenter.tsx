import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

/**
 * AICommandCenter - "Holographic HUD" with Radial Gauge and Data Tickers
 */
export function AICommandCenter() {
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [visibleInsights, setVisibleInsights] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const isMobile = useIsMobile();

  const targetScore = 87;
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  useEffect(() => {
    if (!isInView) return;

    // Simulate AI analysis with progressive score animation
    const timer = setTimeout(() => {
      let current = 0;
      const increment = () => {
        if (current < targetScore) {
          current += 1;
          setHealthScore(current);
          setTimeout(increment, 25);
        } else {
          setIsAnalyzing(false);
        }
      };
      increment();

      setInsights([
        "Spending is 12% lower than last month",
        "Budget optimization could save $240/month",
        "3 subscriptions detected that you rarely use",
        "Emergency fund is 85% complete",
        "Debt payoff ahead of schedule by 2 months",
        "Investment recommendations available"
      ]);
    }, 800);

    return () => clearTimeout(timer);
  }, [isInView]);

  // Type-out effect for insights
  useEffect(() => {
    if (isAnalyzing || insights.length === 0) return;

    const interval = setInterval(() => {
      setVisibleInsights(prev => {
        const maxVisible = isExpanded ? insights.length : (isMobile ? 2 : 3);
        if (prev < maxVisible) return prev + 1;
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isAnalyzing, insights.length, isExpanded, isMobile]);

  // Reset visible insights when expanding/collapsing
  useEffect(() => {
    const maxVisible = isExpanded ? insights.length : (isMobile ? 2 : 3);
    if (visibleInsights > maxVisible) {
      setVisibleInsights(maxVisible);
    }
  }, [isExpanded, isMobile, visibleInsights, insights.length]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--accent))';
    if (score >= 60) return 'hsl(var(--primary))';
    return 'hsl(var(--destructive))';
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 md:mb-6"
    >
      {/* Holographic HUD Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          "p-4 md:p-5 lg:p-6",
          "rounded-3xl",
          // Glass terminal aesthetic
          "backdrop-blur-2xl bg-card/20",
          // Data border with glow
          "border border-primary/30",
          "shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
        )}
      >
        {/* Scan-line effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)'
          }}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 20px hsl(var(--primary) / 0.1)',
              'inset 0 0 40px hsl(var(--primary) / 0.15)',
              'inset 0 0 20px hsl(var(--primary) / 0.1)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Corner brackets (HUD targeting) */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/40 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/40 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/40 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/40 rounded-br" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brain icon + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                animate={isAnalyzing ? { 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" },
                  scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0 }
                }}
                className="relative shrink-0"
              >
                <Brain className="w-6 h-6 md:w-7 md:h-7 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                {isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm md:text-base lg:text-lg flex items-center gap-2">
                  <span className="truncate">AI Financial Intelligence</span>
                  {!isAnalyzing && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-accent rounded-full shrink-0"
                    />
                  )}
                </h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-mono truncate">
                  {isAnalyzing ? "ANALYZING PATTERNS..." : "REAL-TIME INSIGHTS ACTIVE"}
                </p>
              </div>
            </div>

            {/* Right: Radial Gauge + Expand */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Radial Gauge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <svg 
                  width={isMobile ? 70 : 90} 
                  height={isMobile ? 70 : 90} 
                  className="transform -rotate-90"
                >
                  {/* Background ring */}
                  <circle
                    cx={isMobile ? 35 : 45}
                    cy={isMobile ? 35 : 45}
                    r={isMobile ? 28 : 36}
                    fill="none"
                    stroke="hsl(var(--muted) / 0.3)"
                    strokeWidth={isMobile ? 4 : 5}
                  />
                  {/* Progress ring with gradient */}
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                  <motion.circle
                    cx={isMobile ? 35 : 45}
                    cy={isMobile ? 35 : 45}
                    r={isMobile ? 28 : 36}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth={isMobile ? 4 : 5}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * (isMobile ? 28 : 36)}
                    strokeDashoffset={2 * Math.PI * (isMobile ? 28 : 36) - (healthScore / 100) * 2 * Math.PI * (isMobile ? 28 : 36)}
                    style={{
                      filter: !isAnalyzing ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' : 'none'
                    }}
                  />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="font-bold text-lg md:text-xl"
                    style={{ color: getScoreColor(healthScore) }}
                    animate={!isAnalyzing ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {healthScore}
                  </motion.span>
                  <span className="text-[8px] md:text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                    Score
                  </span>
                </div>
                {/* Outer glow pulse when complete */}
                {!isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 hsl(var(--accent) / 0)',
                        '0 0 0 8px hsl(var(--accent) / 0.1)',
                        '0 0 0 0 hsl(var(--accent) / 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse insights" : "Expand insights"}
                aria-expanded={isExpanded}
                className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Data Ticker Insights */}
          <div className="mt-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {insights.slice(0, isExpanded ? insights.length : (isMobile ? 2 : 3)).map((insight, i) => (
                <motion.div
                  key={insight}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: i < visibleInsights ? 1 : 0,
                    x: i < visibleInsights ? 0 : -30
                  }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl",
                    "bg-background/40 backdrop-blur-sm",
                    "hover:bg-background/60 transition-all duration-300 cursor-pointer",
                    "border border-transparent hover:border-primary/20",
                    "p-2.5 md:p-3"
                  )}
                >
                  {/* Terminal prefix */}
                  <span className="text-primary font-mono text-xs shrink-0">&gt;</span>
                  
                  {/* Insight text with typewriter effect simulation */}
                  <span className="text-xs md:text-sm font-medium flex-1 font-mono">
                    {insight}
                  </span>

                  {/* Blinking cursor */}
                  {i === visibleInsights - 1 && (
                    <motion.span
                      className="w-0.5 h-4 bg-primary shrink-0"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Analyzing indicator */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono"
              >
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex gap-1"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </motion.div>
                PROCESSING FINANCIAL DATA...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default AICommandCenter;
