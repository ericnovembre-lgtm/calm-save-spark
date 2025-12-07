import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ScenarioSummary {
  id: string;
  name: string;
  color: string;
  successProbability: number;
  finalNetWorth: {
    median: number;
    p10: number;
    p90: number;
  };
  timeToGoal?: number; // years
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComparisonSummaryCardProps {
  scenarios: ScenarioSummary[];
}

export function ComparisonSummaryCard({ scenarios }: ComparisonSummaryCardProps) {
  // Find baseline or best scenario for comparison
  const baseline = scenarios[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {scenarios.map((scenario, index) => {
        const diff = scenario.finalNetWorth.median - baseline.finalNetWorth.median;
        const diffPercent = baseline.finalNetWorth.median 
          ? (diff / baseline.finalNetWorth.median) * 100 
          : 0;

        return (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative p-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden"
          >
            {/* Color accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: scenario.color }}
            />

            {/* Name */}
            <h4 className="font-mono text-white text-sm mb-3 truncate">
              {scenario.name}
            </h4>

            {/* Success probability */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">Success Rate</span>
                <span className="text-lg font-mono text-white">
                  {scenario.successProbability.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                  style={{ width: `${scenario.successProbability}%` }}
                />
              </div>
            </div>

            {/* Final net worth */}
            <div className="mb-3">
              <div className="text-xs text-white/60 mb-1">Final Net Worth (Median)</div>
              <div className="text-xl font-mono text-white">
                {formatCurrency(scenario.finalNetWorth.median)}
              </div>
              
              {/* Difference from baseline */}
              {index > 0 && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  diff > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {diff > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {diff > 0 ? '+' : ''}{diffPercent.toFixed(1)}% vs baseline
                  </span>
                </div>
              )}
            </div>

            {/* Confidence range */}
            <div className="mb-3 p-2 bg-black/20 rounded border border-white/10">
              <div className="text-xs text-white/60 mb-1">10th - 90th Percentile</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/80">
                  {formatCurrency(scenario.finalNetWorth.p10)}
                </span>
                <span className="text-xs text-white/40">→</span>
                <span className="text-xs font-mono text-white/80">
                  {formatCurrency(scenario.finalNetWorth.p90)}
                </span>
              </div>
            </div>

            {/* Risk assessment */}
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3.5 h-3.5 ${
                scenario.riskLevel === 'high' ? 'text-red-400' :
                scenario.riskLevel === 'medium' ? 'text-amber-400' :
                'text-green-400'
              }`} />
              <span className="text-xs text-white/60">Risk:</span>
              <span className={`text-xs font-mono uppercase ${
                scenario.riskLevel === 'high' ? 'text-red-400' :
                scenario.riskLevel === 'medium' ? 'text-amber-400' :
                'text-green-400'
              }`}>
                {scenario.riskLevel}
              </span>
            </div>

            {/* Time to goal (if available) */}
            {scenario.timeToGoal && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-white/60">Goal in</span>
                  <span className="text-sm font-mono text-white">
                    {scenario.timeToGoal} years
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
