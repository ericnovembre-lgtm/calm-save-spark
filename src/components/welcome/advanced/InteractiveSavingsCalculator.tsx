import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import confetti from 'canvas-confetti';
import { MagneticButton } from './MagneticButton';
import { MorphingNumber } from './MorphingNumber';

interface CalculatorResult {
  total: number;
  interest: number;
  milestone: string | null;
}

/**
 * Interactive Savings Calculator Widget
 * Real-time compound interest calculator with haptic feedback and celebrations
 */
export const InteractiveSavingsCalculator = () => {
  const prefersReducedMotion = useReducedMotion();
  const [monthlyAmount, setMonthlyAmount] = useState(100);
  const [years, setYears] = useState(5);
  const [apy, setApy] = useState(4.25);
  const [result, setResult] = useState<CalculatorResult>({ total: 0, interest: 0, milestone: null });
  const [showCelebration, setShowCelebration] = useState(false);

  const calculateSavings = () => {
    const months = years * 12;
    const monthlyRate = apy / 100 / 12;
    
    // Compound interest formula: FV = P * [((1 + r)^n - 1) / r]
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    const totalContributed = monthlyAmount * months;
    const interest = futureValue - totalContributed;
    
    // Check for milestones
    let milestone: string | null = null;
    if (futureValue >= 100000) milestone = "🎉 Six-Figure Saver!";
    else if (futureValue >= 50000) milestone = "🌟 Halfway to $100K!";
    else if (futureValue >= 25000) milestone = "🚀 Quarter Way There!";
    else if (futureValue >= 10000) milestone = "💪 5-Figure Club!";
    
    return { total: futureValue, interest, milestone };
  };

  useEffect(() => {
    const newResult = calculateSavings();
    setResult(newResult);
    
    // Trigger celebration on milestone
    if (newResult.milestone && !prefersReducedMotion) {
      setShowCelebration(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d6c8a2', '#0a0a0a', '#faf8f2']
      });
      setTimeout(() => setShowCelebration(false), 2000);
    }
  }, [monthlyAmount, years, apy, prefersReducedMotion]);

  return (
    <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
      {/* Ambient gradient */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-accent/20">
            <TrendingUp className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Savings Calculator
            </h3>
            <p className="text-sm text-muted-foreground">
              See your wealth grow over time
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
          {/* Monthly Amount */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Savings
              </label>
              <MorphingNumber 
                value={monthlyAmount} 
                prefix="$" 
                className="text-lg font-bold text-accent"
                duration={0.5}
              />
            </div>
            <Slider
              value={[monthlyAmount]}
              onValueChange={([v]) => setMonthlyAmount(v)}
              min={25}
              max={1000}
              step={25}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$25</span>
              <span>$1,000</span>
            </div>
          </div>

          {/* Time Period */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Period
              </label>
              <span className="text-lg font-bold text-accent">
                {years} {years === 1 ? 'year' : 'years'}
              </span>
            </div>
            <Slider
              value={[years]}
              onValueChange={([v]) => setYears(v)}
              min={1}
              max={30}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 year</span>
              <span>30 years</span>
            </div>
          </div>

          {/* APY */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Interest Rate (APY)
              </label>
              <span className="text-lg font-bold text-accent">
                {apy.toFixed(2)}%
              </span>
            </div>
            <Slider
              value={[apy]}
              onValueChange={([v]) => setApy(v)}
              min={0.1}
              max={10}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.1%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <motion.div
          className="p-6 rounded-xl bg-accent/10 border border-accent/20"
          layout
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Savings</p>
              <MorphingNumber 
                value={result.total} 
                prefix="$" 
                className="text-2xl font-bold text-foreground"
                decimals={0}
                separator=","
                duration={1.5}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interest Earned</p>
              <MorphingNumber 
                value={result.interest} 
                prefix="$" 
                className="text-2xl font-bold text-accent"
                decimals={0}
                separator=","
                duration={1.5}
              />
            </div>
          </div>

          {/* Milestone Badge */}
          <AnimatePresence>
            {result.milestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4 p-3 rounded-lg bg-accent/20 text-center"
              >
                <p className="text-sm font-semibold text-foreground">
                  {result.milestone}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="mt-6">
          <MagneticButton
            variant="primary"
            className="w-full"
            strength={0.3}
            radius={60}
            onClick={() => {
              if (!prefersReducedMotion) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }
            }}
          >
            Start Saving Today
            <TrendingUp className="ml-2 w-4 h-4" />
          </MagneticButton>
        </div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1.5, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
