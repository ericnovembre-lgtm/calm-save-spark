import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import confetti from 'canvas-confetti';

export function AISavingsSimulator() {
  const prefersReducedMotion = useReducedMotion();
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [years, setYears] = useState(5);
  const [interestRate] = useState(5.5);

  const calculateFutureValue = () => {
    const months = years * 12;
    const monthlyRate = interestRate / 100 / 12;
    const fv = monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
    return fv;
  };

  const futureValue = calculateFutureValue();
  const totalContributions = monthlyAmount * years * 12;
  const earnings = futureValue - totalContributions;

  const handleMilestone = () => {
    if (prefersReducedMotion) return;
    if (futureValue > 50000) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Savings Simulator
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how your savings can grow with consistent contributions and compound interest
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="p-8 space-y-8 bg-background/80 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Monthly Amount
                </label>
                <span className="text-2xl font-bold text-primary">
                  ${monthlyAmount}
                </span>
              </div>
              <Slider
                value={[monthlyAmount]}
                onValueChange={(v) => setMonthlyAmount(v[0])}
                min={50}
                max={2000}
                step={50}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Time Period
                </label>
                <span className="text-2xl font-bold text-primary">
                  {years} years
                </span>
              </div>
              <Slider
                value={[years]}
                onValueChange={(v) => setYears(v[0])}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Interest Rate: {interestRate}% annually</span>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-primary/20">
            <motion.div
              key={futureValue}
              initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onAnimationComplete={handleMilestone}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your savings will grow to</p>
                <motion.p
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  animate={prefersReducedMotion ? {} : {
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  ${futureValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </motion.p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Contributions</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    ${totalContributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <p className="text-xs text-muted-foreground">Interest Earned</p>
                  </div>
                  <p className="text-xl font-bold text-accent">
                    ${earnings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <p className="text-xs font-medium text-foreground">AI Insight</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {earnings > totalContributions 
                    ? `Amazing! Your money will earn more than you contribute. The power of compound interest! 🚀`
                    : `Keep going! Increase your contributions to unlock exponential growth.`}
                </p>
              </div>
            </motion.div>
          </Card>
        </div>
      </div>
    </section>
  );
}
