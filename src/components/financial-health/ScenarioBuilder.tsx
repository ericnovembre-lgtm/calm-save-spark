import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calculator, Download, Sparkles, TrendingUp } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import CountUp from 'react-countup';

interface ScenarioBuilderProps {
  currentScore: number;
  components: Record<string, number>;
}

interface Scenario {
  name: string;
  debtPayment: number;
  monthlyDeposit: number;
  projectedScore: number;
  impact: number;
}

export const ScenarioBuilder = ({ currentScore, components }: ScenarioBuilderProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [debtPayment, setDebtPayment] = useState(0);
  const [monthlyDeposit, setMonthlyDeposit] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);

  // Simple projection formula (would be more sophisticated in production)
  const calculateProjection = (debt: number, deposit: number) => {
    const debtImpact = debt * 0.05; // $100 extra = +5 points
    const savingsImpact = deposit * 0.03; // $100 saved = +3 points
    const projectedScore = Math.min(100, currentScore + debtImpact + savingsImpact);
    return Math.round(projectedScore);
  };

  const projectedScore = calculateProjection(debtPayment, monthlyDeposit);
  const impact = projectedScore - currentScore;

  const handleSaveScenario = () => {
    const scenario: Scenario = {
      name: `Scenario ${savedScenarios.length + 1}`,
      debtPayment,
      monthlyDeposit,
      projectedScore,
      impact,
    };
    setSavedScenarios([...savedScenarios, scenario]);
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 10) return 'text-green-600';
    if (impact >= 5) return 'text-blue-600';
    if (impact >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAIComment = (impact: number) => {
    if (impact >= 15) return "🚀 Wow! This would be a game-changer for your financial health!";
    if (impact >= 10) return "🎉 Excellent plan! This could really boost your score!";
    if (impact >= 5) return "👍 Nice! This is a solid improvement strategy.";
    if (impact >= 0) return "💙 Every bit helps! Small steps lead to big wins.";
    return "🤔 Hmm, let's explore other options that might work better!";
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          What-If Scenario Builder
        </h3>
        <p className="text-sm text-muted-foreground">
          Experiment with different financial actions and see their impact
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Debt Payment Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">
                Extra Debt Payment
              </label>
              <span className="text-lg font-bold text-primary">
                ${debtPayment}
              </span>
            </div>
            <Slider
              value={[debtPayment]}
              onValueChange={(v) => setDebtPayment(v[0])}
              max={1000}
              step={50}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Monthly extra payment toward debt
            </p>
          </div>

          {/* Savings Deposit Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">
                Monthly Savings Deposit
              </label>
              <span className="text-lg font-bold text-primary">
                ${monthlyDeposit}
              </span>
            </div>
            <Slider
              value={[monthlyDeposit]}
              onValueChange={(v) => setMonthlyDeposit(v[0])}
              max={1000}
              step={50}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Additional monthly savings contribution
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveScenario}
              variant="outline"
              className="flex-1"
              disabled={debtPayment === 0 && monthlyDeposit === 0}
            >
              Save Scenario
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Export PDF Report"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debtPayment}-${monthlyDeposit}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="relative h-full"
            >
              {/* Split screen comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Current */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Current Score</p>
                  <p className="text-4xl font-bold text-foreground">{currentScore}</p>
                </div>

                {/* Projected */}
                <div className={`p-4 rounded-lg border-2 ${impact > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50 border-border'}`}>
                  <p className="text-xs text-muted-foreground mb-2">Projected Score</p>
                  <p className={`text-4xl font-bold ${impact > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    <CountUp end={projectedScore} duration={0.5} />
                  </p>
                </div>
              </div>

              {/* Impact indicator */}
              <motion.div
                className={`p-4 rounded-lg border-2 ${impact > 0 ? 'bg-primary/5 border-primary/30' : 'bg-muted/50 border-border'}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Estimated Impact
                  </span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${getImpactColor(impact)}`} />
                    <span className={`text-2xl font-bold ${getImpactColor(impact)}`}>
                      {impact > 0 ? '+' : ''}{impact}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${(impact / 20) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Over 3 months with consistent actions
                </p>
              </motion.div>

              {/* AI Comment */}
              <motion.div
                className="mt-4 p-4 rounded-lg bg-accent/50 border border-border/50 flex items-start gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {getAIComment(impact)}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">Saved Scenarios</h4>
          <div className="grid gap-3">
            {savedScenarios.map((scenario, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div>
                  <p className="font-medium text-foreground">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Debt: ${scenario.debtPayment} | Savings: ${scenario.monthlyDeposit}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getImpactColor(scenario.impact)}`}>
                    {scenario.projectedScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scenario.impact > 0 ? '+' : ''}{scenario.impact} impact
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
