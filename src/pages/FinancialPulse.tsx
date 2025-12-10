import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PulseHealthScore } from '@/components/financial-pulse/PulseHealthScore';
import { PulseMetricCard } from '@/components/financial-pulse/PulseMetricCard';
import { PulseInsights } from '@/components/financial-pulse/PulseInsights';
import { useFinancialPulse } from '@/hooks/useFinancialPulse';
import { format } from 'date-fns';

export default function FinancialPulse() {
  const { data: pulse, isLoading, refetch, isRefetching } = useFinancialPulse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-40 bg-muted rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pulse) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load financial pulse</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const metrics = Object.values(pulse.metrics);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24" data-copilot-id="financial-pulse-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Financial Pulse
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {format(new Date(pulse.lastUpdated), 'MMM d, h:mm a')}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Health Score */}
        <PulseHealthScore score={pulse.healthScore} />

        {/* Metrics Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <PulseMetricCard key={metric.label} metric={metric} index={index} />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <PulseInsights insights={pulse.insights} />

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-6"
        >
          <h3 className="font-semibold mb-3">📊 Quick Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Overall Progress</p>
              <p className="font-semibold text-lg">{pulse.healthScore}% healthy</p>
            </div>
            <div>
              <p className="text-muted-foreground">Areas to Improve</p>
              <p className="font-semibold text-lg">
                {metrics.filter(m => m.status === 'warning' || m.status === 'critical').length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Doing Well</p>
              <p className="font-semibold text-lg text-green-600">
                {metrics.filter(m => m.status === 'good').length} areas
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Insights</p>
              <p className="font-semibold text-lg">{pulse.insights.length}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
