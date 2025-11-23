import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useLiquidityData } from '@/hooks/useLiquidityData';
import { supabase } from '@/integrations/supabase/client';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ChevronDown, Check } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface HealthAnalysis {
  health_score: number;
  score_label: string;
  strengths: string[];
  risks: { description: string; severity: 'low' | 'medium' | 'high' }[];
  recommendations: { title: string; description: string; impact: string }[];
  summary: string;
  analyzed_at: string;
}

export const LiquidityHero = () => {
  const { data: liquidity, isLoading, error } = useLiquidityData();
  
  console.log('[LiquidityHero] State:', { liquidity, isLoading, error });
  const [insight, setInsight] = useState<string>('Calculating your financial runway...');
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Fetch AI insight
  useEffect(() => {
    if (!liquidity) return;

    const fetchInsight = async () => {
      try {
        const { data } = await supabase.functions.invoke('generate-liquidity-insight', {
          body: {
            runway: liquidity.runway,
            safeToSpend: liquidity.safeToSpend,
            upcomingBills: liquidity.upcomingBills,
          },
        });

        if (data?.insight) {
          setInsight(data.insight);
        }
      } catch (error) {
        console.error('Error fetching insight:', error);
        setInsight(`You have ${liquidity.runway} days of runway at your current pace.`);
      }
    };

    fetchInsight();
  }, [liquidity]);

  // Liquid wave animation
  useEffect(() => {
    if (!canvasRef.current || !liquidity || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * 2; // Retina
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const waveHeight = (liquidity.safeToSpend / Math.max(liquidity.totalCash, 1)) * (height / 2);
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create gradient for liquid
      const gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
      gradient.addColorStop(0, 'hsl(186 80% 65% / 0.6)'); // Cyan-400
      gradient.addColorStop(1, 'hsl(186 80% 75% / 0.4)'); // Cyan-300

      // Draw wave
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width / 2; x += 5) {
        const y = (height / 2) - waveHeight + Math.sin((x / 50) + (frame / 10)) * 10;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width / 2, height / 2);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
      ctx.fill();

      frame++;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [liquidity, prefersReducedMotion]);

  const runHealthScan = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-liquidity-health');
      if (error) throw error;
      setHealthAnalysis(data);
    } catch (error) {
      console.error('Error running health scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'hsl(142 76% 36%)'; // emerald-600
    if (score >= 75) return 'hsl(142 71% 45%)'; // green-500
    if (score >= 60) return 'hsl(43 96% 56%)'; // amber-500
    if (score >= 40) return 'hsl(25 95% 53%)'; // orange-500
    return 'hsl(0 84% 60%)'; // rose-500
  };

  if (error) {
    console.error('[LiquidityHero] Error state:', error);
    return (
      <div className="relative h-80 rounded-2xl overflow-hidden bg-glass border border-glass-border backdrop-blur-glass">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">Error loading liquidity data</p>
          <p className="text-xs text-muted-foreground mt-2">{error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !liquidity) {
    console.log('[LiquidityHero] Loading state');
    return (
      <div className="relative h-80 rounded-2xl overflow-hidden bg-glass border border-glass-border backdrop-blur-glass animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-48 bg-muted rounded" />
          <p className="text-sm text-muted-foreground mt-4">Loading liquidity data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-80 rounded-2xl overflow-hidden bg-glass border border-glass-border backdrop-blur-glass"
    >
      {/* Liquid wave background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Safe to Spend
          </p>
          <div className="text-6xl font-bold text-foreground tabular-nums">
            $<CountUp end={liquidity.safeToSpend} duration={1.5} decimals={0} separator="," />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-base text-muted-foreground max-w-md"
        >
          {insight}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-8 text-sm"
        >
          <div>
            <p className="text-muted-foreground">Total Cash</p>
            <p className="font-semibold text-foreground">${liquidity.totalCash.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Upcoming Bills</p>
            <p className="font-semibold text-foreground">${liquidity.upcomingBills.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Runway</p>
            <p className="font-semibold text-foreground">{liquidity.runway} days</p>
          </div>
        </motion.div>

        {/* Health Scan Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            onClick={runHealthScan}
            disabled={isScanning}
            className="gap-2 bg-background/50 backdrop-blur-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Health Scan
              </>
            )}
          </Button>
        </motion.div>

        {/* Health Analysis Results */}
        <AnimatePresence>
          {healthAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border"
            >
              {/* Health Score Gauge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getScoreColor(healthAnalysis.health_score)}
                      strokeWidth="8"
                      strokeDasharray={`${(healthAnalysis.health_score / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{healthAnalysis.health_score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">{healthAnalysis.score_label}</div>
                  <div className="text-sm text-muted-foreground">{healthAnalysis.summary}</div>
                </div>
              </div>

              {/* Collapsible Details */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  View Detailed Analysis
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Strengths */}
                  {healthAnalysis.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-green-600 mb-2">✓ Strengths</h4>
                      <ul className="space-y-1 text-sm">
                        {healthAnalysis.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {healthAnalysis.risks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-rose-600 mb-2">⚠️ Risks</h4>
                      <div className="space-y-2">
                        {healthAnalysis.risks.map((r, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-2 rounded-lg text-sm",
                              r.severity === 'high' && "bg-rose-500/10 border border-rose-500/20",
                              r.severity === 'medium' && "bg-amber-500/10 border border-amber-500/20",
                              r.severity === 'low' && "bg-blue-500/10 border border-blue-500/20"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={r.severity === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {r.severity}
                              </Badge>
                              <span>{r.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {healthAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-violet-600 mb-2">💡 Recommendations</h4>
                      <div className="space-y-3">
                        {healthAnalysis.recommendations.map((rec, i) => (
                          <div key={i} className="p-3 bg-violet-500/5 rounded-lg border border-violet-500/10">
                            <div className="font-medium text-sm mb-1">{rec.title}</div>
                            <div className="text-xs text-muted-foreground mb-2">{rec.description}</div>
                            <Badge variant="outline" className="text-xs">
                              Impact: {rec.impact}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};