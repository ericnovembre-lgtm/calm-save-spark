import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAIDebtOptimization } from '@/hooks/useAIDebtOptimization';
import { DebtAIReasoningPanel } from './DebtAIReasoningPanel';
import { Calculator, TrendingDown, Calendar, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths } from 'date-fns';

interface DebtPayoffCalculatorProps {
  strategy: 'avalanche' | 'snowball';
  hasDebts: boolean;
}

export const DebtPayoffCalculator = ({ strategy, hasDebts }: DebtPayoffCalculatorProps) => {
  const [extraPayment, setExtraPayment] = useState(0);
  const [enableAI, setEnableAI] = useState(false);

  const { 
    summary, 
    comparison,
    aiRecommendations, 
    reasoningChain,
    isLoading 
  } = useAIDebtOptimization({
    strategy,
    extraPayment,
    enabled: hasDebts,
    includeAI: enableAI
  });

  const baselineMonths = comparison?.avalanche?.months_to_payoff || comparison?.snowball?.months_to_payoff || 0;
  const monthsSaved = baselineMonths - (summary?.months_to_payoff || 0);
  const baselineInterest = comparison?.avalanche?.total_interest_paid || comparison?.snowball?.total_interest_paid || 0;
  const interestSaved = baselineInterest - (summary?.total_interest_paid || 0);
  
  const debtFreeDate = summary?.months_to_payoff 
    ? format(addMonths(new Date(), summary.months_to_payoff), 'MMMM yyyy')
    : null;

  if (!hasDebts) return null;

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Payoff Calculator</h3>
            <p className="text-sm text-muted-foreground">See how extra payments accelerate your freedom</p>
          </div>
        </div>
        
        {/* AI Toggle */}
        <div className="flex items-center gap-2">
          <Brain className={`h-4 w-4 ${enableAI ? 'text-amber-400' : 'text-muted-foreground'}`} />
          <Switch
            id="ai-optimization"
            checked={enableAI}
            onCheckedChange={setEnableAI}
          />
          <Label htmlFor="ai-optimization" className="text-sm text-muted-foreground cursor-pointer">
            AI Optimization
          </Label>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-foreground">Extra Monthly Payment</label>
            <span className="text-2xl font-bold text-primary">${extraPayment}</span>
          </div>
          <Slider
            value={[extraPayment]}
            onValueChange={([value]) => setExtraPayment(value)}
            max={1000}
            step={25}
            className="w-full"
          />
        </div>

        {!isLoading && summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Debt-Free Date</p>
              </div>
              <p className="text-lg font-bold text-foreground">{debtFreeDate}</p>
              {monthsSaved > 0 && extraPayment > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {monthsSaved} months faster!
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                <p className="text-xs text-muted-foreground">Interest Saved</p>
              </div>
              <p className="text-lg font-bold text-emerald-600">
                ${interestSaved > 0 ? interestSaved.toLocaleString() : '0'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Total Interest</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                ${(summary.total_interest_paid || 0).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {extraPayment > 0 && monthsSaved > 0 && !enableAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/20"
          >
            <p className="text-sm font-medium text-foreground">
              By paying an extra <span className="text-primary font-bold">${extraPayment}/month</span>, 
              you'll save <span className="text-emerald-600 font-bold">${interestSaved.toLocaleString()}</span> in 
              interest and become debt-free <span className="font-bold">{monthsSaved} months sooner</span>!
            </p>
          </motion.div>
        )}

        {/* AI Recommendations Panel */}
        <AnimatePresence>
          {enableAI && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DebtAIReasoningPanel
                recommendations={aiRecommendations}
                reasoningChain={reasoningChain}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
