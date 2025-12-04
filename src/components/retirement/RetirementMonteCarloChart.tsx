import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Activity, Brain } from 'lucide-react';
import { MonteCarloResults } from '@/hooks/useRetirementPlanner';

interface RetirementMonteCarloChartProps {
  results?: MonteCarloResults;
  retirementAge?: number;
  isLoading?: boolean;
}

export function RetirementMonteCarloChart({ results, retirementAge = 65, isLoading }: RetirementMonteCarloChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Calculate your retirement plan to see Monte Carlo projections</p>
      </Card>
    );
  }

  const getSuccessColor = (probability: number) => {
    if (probability >= 90) return 'text-green-500';
    if (probability >= 75) return 'text-emerald-500';
    if (probability >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuccessBg = (probability: number) => {
    if (probability >= 90) return 'from-green-500/20 to-green-500/5';
    if (probability >= 75) return 'from-emerald-500/20 to-emerald-500/5';
    if (probability >= 50) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Monte Carlo Retirement Projection</h3>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Brain className="w-3 h-3 mr-1" />
          1,000+ Simulations
        </Badge>
      </div>

      {/* Success Probability Gauge */}
      <div className={`mb-6 p-6 rounded-xl bg-gradient-to-br ${getSuccessBg(results.successProbability)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Success Probability</p>
            <div className="flex items-baseline gap-2">
              <motion.p
                className={`text-5xl font-bold ${getSuccessColor(results.successProbability)}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {results.successProbability}%
              </motion.p>
              <span className="text-muted-foreground">chance of success</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Median Outcome</p>
            <p className="text-2xl font-semibold">${(results.medianOutcome / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        {/* Success Bar */}
        <div className="mt-4">
          <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${results.successProbability >= 75 ? 'bg-green-500' : results.successProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${results.successProbability}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Outcome Distribution */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <p className="text-xs text-muted-foreground">10th Percentile (Bad)</p>
          <p className="text-xl font-semibold text-red-500">
            ${(results.p10Outcome / 1000000).toFixed(2)}M
          </p>
        </Card>
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-xs text-muted-foreground">50th Percentile (Median)</p>
          <p className="text-xl font-semibold text-emerald-500">
            ${(results.medianOutcome / 1000000).toFixed(2)}M
          </p>
        </Card>
        <Card className="p-4 bg-green-500/5 border-green-500/20">
          <p className="text-xs text-muted-foreground">90th Percentile (Good)</p>
          <p className="text-xl font-semibold text-green-500">
            ${(results.p90Outcome / 1000000).toFixed(2)}M
          </p>
        </Card>
      </div>

      {/* Projection Chart */}
      {results.scenarios && results.scenarios.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.scenarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="retirementP90" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="retirementP50" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, '']}
              />
              <ReferenceLine
                x={retirementAge}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                label={{ value: 'Retirement', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="p90"
                stroke="hsl(var(--primary))"
                fill="url(#retirementP90)"
                strokeWidth={1}
                name="90th Percentile"
              />
              <Area
                type="monotone"
                dataKey="p50"
                stroke="hsl(142 76% 36%)"
                fill="url(#retirementP50)"
                strokeWidth={2}
                name="Median"
              />
              <Area
                type="monotone"
                dataKey="p10"
                stroke="hsl(0 84% 60%)"
                fill="none"
                strokeWidth={1}
                strokeDasharray="4 4"
                name="10th Percentile"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
