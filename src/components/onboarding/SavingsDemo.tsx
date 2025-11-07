import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { trackEvent } from "@/lib/analytics";

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  roundUp: number;
  icon: string;
}

interface SavingsDemoProps {
  onGetStarted: () => void;
}

const SAMPLE_TRANSACTIONS: Omit<Transaction, "id">[] = [
  { merchant: "Coffee Shop", amount: 4.75, roundUp: 0.25, icon: "coffee" },
  { merchant: "Grocery Store", amount: 47.32, roundUp: 0.68, icon: "shopping-cart" },
  { merchant: "Gas Station", amount: 38.90, roundUp: 1.10, icon: "fuel" },
  { merchant: "Restaurant", amount: 23.45, roundUp: 0.55, icon: "utensils" },
  { merchant: "Online Shop", amount: 56.18, roundUp: 0.82, icon: "shopping-bag" },
  { merchant: "Pharmacy", amount: 12.67, roundUp: 0.33, icon: "heart-pulse" },
];

const SavingsDemo = ({ onGetStarted }: SavingsDemoProps) => {
  const [weeklySpending, setWeeklySpending] = useState<number[]>([200]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();

  const estimatedMonthlySavings = Math.round((weeklySpending[0] / 7) * 0.5 * 30);

  useEffect(() => {
    trackEvent("savings_demo_viewed", { weeklySpending: weeklySpending[0] });
  }, []);

  const runDemo = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTransactions([]);
    setTotalSavings(0);
    triggerHaptic("light");
    
    trackEvent("savings_demo_started", { weeklySpending: weeklySpending[0] });

    SAMPLE_TRANSACTIONS.forEach((txn, index) => {
      setTimeout(() => {
        const newTxn = { ...txn, id: `${Date.now()}-${index}` };
        setTransactions(prev => [newTxn, ...prev]);
        setTotalSavings(prev => prev + txn.roundUp);
        triggerHaptic("light");
      }, index * (prefersReducedMotion ? 100 : 800));
    });

    setTimeout(() => {
      setIsAnimating(false);
      triggerHaptic("success");
    }, SAMPLE_TRANSACTIONS.length * (prefersReducedMotion ? 100 : 800) + 500);
  };

  useEffect(() => {
    runDemo();
  }, [weeklySpending]);

  const handleGetStarted = () => {
    trackEvent("savings_demo_cta_clicked", { 
      estimatedSavings: estimatedMonthlySavings,
      weeklySpending: weeklySpending[0]
    });
    triggerHaptic("medium");
    onGetStarted();
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <SaveplusAnimIcon 
            name="coins" 
            size={80}
            className="text-[color:var(--color-accent)]"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          See Your Savings in Action
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Watch how micro-savings from everyday purchases add up over time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Calculator Card */}
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[color:var(--color-accent)]" />
              <h3 className="font-semibold text-foreground">Your Spending</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm text-muted-foreground">
                    Weekly Spending
                  </label>
                  <span className="text-2xl font-bold text-foreground">
                    ${weeklySpending[0]}
                  </span>
                </div>
                <Slider
                  value={weeklySpending}
                  onValueChange={setWeeklySpending}
                  min={50}
                  max={500}
                  step={10}
                  className="mb-2"
                  aria-label="Adjust weekly spending amount"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Adjust to match your typical spending
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Estimated Monthly Savings
                  </span>
                  <TrendingUp className="w-4 h-4 text-[color:var(--color-accent)]" />
                </div>
                <motion.div
                  key={estimatedMonthlySavings}
                  initial={prefersReducedMotion ? false : { scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-[color:var(--color-accent)] animate-subtle-glow"
                >
                  ${estimatedMonthlySavings}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on average round-ups
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Feed Card */}
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Live Demo</h3>
              <motion.div
                animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl font-bold text-[color:var(--color-accent)]"
              >
                +${totalSavings.toFixed(2)}
              </motion.div>
            </div>

            <div className="space-y-2 h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
              <AnimatePresence mode="popLayout">
                {transactions.map((txn) => (
                  <motion.div
                    key={txn.id}
                    initial={prefersReducedMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50 hover:border-[color:var(--color-accent)]/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <SaveplusAnimIcon name={txn.icon as any} size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {txn.merchant}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${txn.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[color:var(--color-accent)]">
                        +${txn.roundUp.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">saved</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {transactions.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Adjust spending to see demo...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="gap-2 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90 text-[color:var(--color-text-on-accent)] shadow-[var(--shadow-soft)] hover-scale"
          aria-label="Start saving with this method"
        >
          Start Saving Like This
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          No credit card required • Takes 2 minutes
        </p>
      </div>
    </motion.div>
  );
};

export default SavingsDemo;
