import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Shield, Target, Brain } from 'lucide-react';
import { RiskMetrics } from '@/hooks/usePortfolioOptimization';

interface RiskAdjustedDashboardProps {
  riskMetrics?: RiskMetrics;
  optimalAllocation?: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };
  isLoading?: boolean;
}

export function RiskAdjustedDashboard({ riskMetrics, optimalAllocation, isLoading }: RiskAdjustedDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Run portfolio optimization to see risk-adjusted metrics</p>
      </Card>
    );
  }

  const getSharpeColor = (ratio: number) => {
    if (ratio >= 1.5) return 'text-green-500';
    if (ratio >= 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDrawdownColor = (dd: number) => {
    if (dd <= 10) return 'text-green-500';
    if (dd <= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Sharpe Ratio</span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${getSharpeColor(riskMetrics.sharpeRatio)}`}>
              {riskMetrics.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {riskMetrics.sharpeRatio >= 1.5 ? 'Excellent' : riskMetrics.sharpeRatio >= 1 ? 'Good' : 'Below Average'}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Sortino Ratio</span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${getSharpeColor(riskMetrics.sortinoRatio)}`}>
              {riskMetrics.sortinoRatio.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Downside risk-adjusted
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Max Drawdown</span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${getDrawdownColor(riskMetrics.maxDrawdown)}`}>
              {riskMetrics.maxDrawdown.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Peak to trough
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-violet-500/5 to-violet-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Beta</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {riskMetrics.beta.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {riskMetrics.beta > 1 ? 'More volatile than market' : 'Less volatile than market'}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Volatility</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {riskMetrics.volatility.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Annual std deviation
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Optimal Allocation */}
      {optimalAllocation && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI-Recommended Allocation</h3>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ml-auto">
              <Brain className="w-3 h-3 mr-1" />
              Deepseek Reasoner
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Allocation Bars */}
            <div className="flex h-8 rounded-lg overflow-hidden">
              <motion.div
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                initial={{ width: 0 }}
                animate={{ width: `${optimalAllocation.stocks}%` }}
                transition={{ duration: 0.5 }}
              >
                {optimalAllocation.stocks}%
              </motion.div>
              <motion.div
                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                initial={{ width: 0 }}
                animate={{ width: `${optimalAllocation.bonds}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {optimalAllocation.bonds}%
              </motion.div>
              <motion.div
                className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
                initial={{ width: 0 }}
                animate={{ width: `${optimalAllocation.cash}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {optimalAllocation.cash}%
              </motion.div>
              <motion.div
                className="bg-violet-500 flex items-center justify-center text-white text-xs font-medium"
                initial={{ width: 0 }}
                animate={{ width: `${optimalAllocation.alternatives}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {optimalAllocation.alternatives}%
              </motion.div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Stocks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Bonds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span>Alternatives</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
