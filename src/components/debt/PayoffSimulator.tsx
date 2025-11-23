import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Zap, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useOptimizedDebtSimulation } from '@/hooks/useOptimizedDebtSimulation';
import { DebtPayoffChart } from '@/components/debt/DebtPayoffChart';
import { DebtMountainVisualizer } from './DebtMountainVisualizer';
import { StrategyInsightBadge } from './StrategyInsightBadge';
import { StrategyToggle } from './StrategyToggle';
import { CostOfWaitingBadge } from './CostOfWaitingBadge';
import type { Database } from '@/integrations/supabase/types';
import { format, addMonths } from 'date-fns';

type Debt = Database['public']['Tables']['debts']['Row'];

interface PayoffSimulatorProps {
  debts: Debt[];
  userId?: string;
}

export default function PayoffSimulator({ debts }: PayoffSimulatorProps) {
  const [extraPayment, setExtraPayment] = useState(0);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // Use optimized hooks for both strategies
  const { summary: avalancheSummary, simulation: avalancheSimulation, isLoading: avalancheLoading } = 
    useOptimizedDebtSimulation({
      strategy: 'avalanche',
      extraPayment,
      enabled: debts.length > 0
    });

  const { summary: snowballSummary, simulation: snowballSimulation, isLoading: snowballLoading } = 
    useOptimizedDebtSimulation({
      strategy: 'snowball',
      extraPayment,
      enabled: debts.length > 0
    });

  // Calculate debt-free date based on current strategy
  const debtFreeDate = useMemo(() => {
    const summary = strategy === 'avalanche' ? avalancheSummary : snowballSummary;
    if (!summary?.months_to_payoff) return null;
    
    const futureDate = addMonths(new Date(), summary.months_to_payoff);
    return format(futureDate, 'MMMM yyyy');
  }, [strategy, avalancheSummary, snowballSummary]);

  const monthsToFreedom = useMemo(() => {
    const summary = strategy === 'avalanche' ? avalancheSummary : snowballSummary;
    return summary?.months_to_payoff || 0;
  }, [strategy, avalancheSummary, snowballSummary]);

  if (debts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Add debts to see payoff simulations</p>
      </Card>
    );
  }

  const isLoading = avalancheLoading || snowballLoading;
  const currentSimulation = strategy === 'avalanche' ? avalancheSimulation : snowballSimulation;

  return (
    <div className="space-y-6">
      {/* Debt Mountain Hero */}
      <DebtMountainVisualizer
        simulation={currentSimulation}
        debtFreeDate={debtFreeDate}
        monthsToFreedom={monthsToFreedom}
        isLoading={isLoading}
      />

      {/* Cost of Waiting Badge */}
      <CostOfWaitingBadge debts={debts} />

      {/* Extra Payment Slider */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
            <span className="text-2xl font-bold text-primary">${extraPayment}</span>
          </div>
          <Slider
            id="extra-payment"
            value={[extraPayment]}
            onValueChange={(v) => setExtraPayment(v[0])}
            max={1000}
            step={25}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Adjust to see how extra payments accelerate your debt-free date
          </p>
        </div>
      </Card>

      {/* Strategy Toggle */}
      <StrategyToggle strategy={strategy} onChange={setStrategy} />

      {/* AI Insight Badge */}
      <StrategyInsightBadge
        avalancheSummary={avalancheSummary}
        snowballSummary={snowballSummary}
        currentStrategy={strategy}
      />

      {/* Strategy Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Avalanche Strategy */}
        <Card className="p-6 border-2 border-primary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Avalanche Method</h3>
                <p className="text-sm text-muted-foreground">Highest interest first</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ) : avalancheSummary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time to Freedom</span>
                  </div>
                  <span className="text-xl font-bold">{avalancheSummary.years_to_payoff} years</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                  </div>
                  <span className="text-xl font-bold text-destructive">
                    ${avalancheSummary.total_interest_paid?.toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                  </div>
                  <span className="text-xl font-bold">
                    ${avalancheSummary.total_paid?.toFixed(2) || '0'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Snowball Strategy */}
        <Card className="p-6 border-2 border-secondary/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingDown className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Snowball Method</h3>
                <p className="text-sm text-muted-foreground">Smallest balance first</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ) : snowballSummary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time to Freedom</span>
                  </div>
                  <span className="text-xl font-bold">{snowballSummary.years_to_payoff} years</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                  </div>
                  <span className="text-xl font-bold text-destructive">
                    ${snowballSummary.total_interest_paid?.toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                  </div>
                  <span className="text-xl font-bold">
                    ${snowballSummary.total_paid?.toFixed(2) || '0'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Charts */}
      {!isLoading && currentSimulation && (
        <DebtPayoffChart simulation={currentSimulation} strategy={strategy} />
      )}
    </div>
  );
}
