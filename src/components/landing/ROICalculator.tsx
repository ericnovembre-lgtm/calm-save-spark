import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Slider } from '@/components/ui/slider';
import CountUp from 'react-countup';
import { TrendingUp } from 'lucide-react';

export const ROICalculator = () => {
  const prefersReducedMotion = useReducedMotion();
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [currentAge, setCurrentAge] = useState(25);
  const [retirementAge, setRetirementAge] = useState(65);

  // Calculation logic
  const savingsRate = 0.20; // $ave+ helps save 20%
  const months = (retirementAge - currentAge) * 12;
  const monthlyContribution = monthlyIncome * savingsRate;
  const annualReturn = 0.07; // 7% compound interest
  
  const futureValue = monthlyContribution * 
    ((Math.pow(1 + annualReturn / 12, months) - 1) / (annualReturn / 12));
  
  const totalContributions = monthlyContribution * months;
  const interestEarned = futureValue - totalContributions;

  // Without $ave+ (0% savings rate)
  const withoutSaveValue = 0;

  return (
    <section className="py-32 px-4 md:px-20 bg-background" id="calculator">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-foreground mb-6 tracking-tighter">
            Your Financial Future
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            See how much wealth you could build with $ave+ helping you save consistently
          </p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Controls */}
          <div className="space-y-8 p-8 rounded-3xl bg-card/80 border border-border backdrop-blur-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-muted-foreground">Monthly Income</label>
                <span className="text-2xl font-bold text-accent">
                  ${monthlyIncome.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[monthlyIncome]}
                onValueChange={([v]) => setMonthlyIncome(v)}
                min={1000}
                max={20000}
                step={500}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-muted-foreground">Current Age</label>
                <span className="text-2xl font-bold text-accent">{currentAge}</span>
              </div>
              <Slider
                value={[currentAge]}
                onValueChange={([v]) => setCurrentAge(v)}
                min={18}
                max={65}
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-muted-foreground">Retirement Age</label>
                <span className="text-2xl font-bold text-accent">{retirementAge}</span>
              </div>
              <Slider
                value={[retirementAge]}
                onValueChange={([v]) => setRetirementAge(Math.max(v, currentAge + 1))}
                min={currentAge + 1}
                max={75}
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">
                💡 $ave+ helps you save 20% of your income automatically
              </div>
              <div className="text-lg font-semibold text-foreground">
                Monthly Savings: <span className="text-accent">${monthlyContribution.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            <motion.div
              className="p-8 rounded-3xl bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 border border-accent/30 backdrop-blur-xl shadow-[var(--shadow-premium)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-accent/20">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">Projected Net Worth at {retirementAge}</div>
                  <div className="text-5xl md:text-6xl font-display font-black text-accent tracking-tighter">
                    $<CountUp end={futureValue} duration={2} separator="," decimals={0} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">Total Contributions</div>
                  <div className="text-xl font-bold text-foreground">
                    ${totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-card/50">
                  <div className="text-xs text-muted-foreground mb-1">Interest Earned</div>
                  <div className="text-xl font-bold text-green-500">
                    +${interestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comparison */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-muted/30 backdrop-blur-sm"
            >
              <div className="text-sm font-semibold text-muted-foreground mb-4">
                Comparison: With vs Without $ave+
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-12 rounded-lg bg-accent/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent flex items-center justify-end px-4 text-sm font-semibold text-white"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      ${(futureValue / 1000).toFixed(0)}k
                    </motion.div>
                  </div>
                  <span className="text-sm text-muted-foreground w-24">With $ave+</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-12 rounded-lg bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full bg-muted flex items-center justify-end px-4 text-sm font-semibold text-muted-foreground"
                      initial={{ width: 0 }}
                      whileInView={{ width: '0%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                    >
                      ${withoutSaveValue}
                    </motion.div>
                  </div>
                  <span className="text-sm text-muted-foreground w-24">Without</span>
                </div>
              </div>
            </motion.div>

            <motion.a
              href="/onboarding"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="block w-full py-5 px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-center font-display font-bold text-lg shadow-[var(--shadow-premium)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
            >
              Start Building Wealth Today
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
