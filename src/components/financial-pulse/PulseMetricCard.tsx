import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PulseMetric } from '@/hooks/useFinancialPulse';

interface PulseMetricCardProps {
  metric: PulseMetric;
  index: number;
  formatValue?: (value: number) => string;
}

export function PulseMetricCard({ metric, index, formatValue }: PulseMetricCardProps) {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'good': return 'border-green-500/30 bg-green-500/5';
      case 'warning': return 'border-amber-500/30 bg-amber-500/5';
      case 'critical': return 'border-red-500/30 bg-red-500/5';
    }
  };

  const getStatusDot = () => {
    switch (metric.status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  const displayValue = formatValue 
    ? formatValue(metric.value) 
    : metric.label.includes('Spending') || metric.label.includes('Net Worth')
      ? `$${metric.value.toLocaleString()}`
      : `${Math.round(metric.value)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl border p-4 ${getStatusColor()}`}
      data-copilot-id={`pulse-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{metric.icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-foreground">{displayValue}</span>
        
        <div className={`flex items-center gap-1 text-xs ${
          metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(metric.trendValue).toFixed(1)}%</span>
        </div>
      </div>

      {/* Progress bar for percentage metrics */}
      {!metric.label.includes('Spending') && !metric.label.includes('Net Worth') && (
        <div className="mt-3 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              metric.status === 'good' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, metric.value)}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
}
