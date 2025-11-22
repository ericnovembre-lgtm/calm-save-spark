import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScenarioCalculation } from '@/hooks/useScenarioCalculation';
import { LoadingState } from '@/components/LoadingState';
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '@/components/charts/LazyAreaChart';
import { TrendingUp, DollarSign, Calendar, Shield } from 'lucide-react';

const PRESETS = {
  aggressive: { monthlyInvestment: 1000, savingsRate: 8, timeHorizonYears: 10, emergencyFund: 5000 },
  balanced: { monthlyInvestment: 500, savingsRate: 5, timeHorizonYears: 15, emergencyFund: 3000 },
  conservative: { monthlyInvestment: 200, savingsRate: 2, timeHorizonYears: 20, emergencyFund: 1000 },
};

export function ScenarioPlayground() {
  const prefersReducedMotion = useReducedMotion();
  const { params, result, isLoading, updateParams } = useScenarioCalculation(PRESETS.balanced);

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const presetParams = PRESETS[preset];
    Object.entries(presetParams).forEach(([key, value]) => {
      updateParams({ [key]: value } as any);
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Scenario Playground</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Adjust the sliders to see how different strategies affect your financial future
        </p>

        {/* Presets */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('aggressive')}
          >
            Aggressive Saver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('balanced')}
          >
            Balanced Growth
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('conservative')}
          >
            Safety First
          </Button>
        </div>

        {/* Controls */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Monthly Investment: ${params.monthlyInvestment}
                </label>
              </div>
              <Slider
                value={[params.monthlyInvestment]}
                onValueChange={([value]) => updateParams({ monthlyInvestment: value })}
                min={0}
                max={5000}
                step={50}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Savings Rate: {params.savingsRate}% APY
                </label>
              </div>
              <Slider
                value={[params.savingsRate]}
                onValueChange={([value]) => updateParams({ savingsRate: value })}
                min={1}
                max={15}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Time Horizon: {params.timeHorizonYears} years
                </label>
              </div>
              <Slider
                value={[params.timeHorizonYears]}
                onValueChange={([value]) => updateParams({ timeHorizonYears: value })}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Emergency Fund: ${params.emergencyFund}
                </label>
              </div>
              <Slider
                value={[params.emergencyFund]}
                onValueChange={([value]) => updateParams({ emergencyFund: value })}
                min={0}
                max={10000}
                step={500}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <LoadingState />
      ) : result ? (
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4">Projected Growth Scenarios</h4>
          <LazyAreaChart data={result.moderate} height={350}>
            <defs>
              <linearGradient id="conservativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="moderateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="aggressiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--muted))" fill="url(#conservativeGrad)" name="Conservative" strokeDasharray="5 5" />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#moderateGrad)" name="Moderate" strokeWidth={2} />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="url(#aggressiveGrad)" name="Aggressive" strokeDasharray="3 3" />
          </LazyAreaChart>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-sm text-muted-foreground">Conservative Growth</p>
              <p className="text-2xl font-bold text-foreground">
                ${result.conservative[result.conservative.length - 1]?.value.toFixed(0) || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <p className="text-sm text-muted-foreground">Moderate Growth</p>
              <p className="text-2xl font-bold text-foreground">
                ${result.moderate[result.moderate.length - 1]?.value.toFixed(0) || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-sm text-muted-foreground">Aggressive Growth</p>
              <p className="text-2xl font-bold text-foreground">
                ${result.aggressive[result.aggressive.length - 1]?.value.toFixed(0) || 0}
              </p>
            </div>
          </div>
        </Card>
      ) : null}
    </motion.div>
  );
}
