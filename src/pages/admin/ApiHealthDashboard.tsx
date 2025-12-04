import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield, AlertTriangle, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroqQuotaMonitor } from '@/components/alerts/GroqQuotaMonitor';
import { BatchProcessingMonitor } from '@/components/alerts/BatchProcessingMonitor';
import { LatencyTrendChart } from '@/components/admin/LatencyTrendChart';
import { CircuitBreakerTimeline } from '@/components/admin/CircuitBreakerTimeline';
import { useApiHealthMetrics } from '@/hooks/useApiHealthMetrics';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

type TimeRange = '24h' | '7d' | '30d';

export default function ApiHealthDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data: metrics, isLoading, refetch } = useApiHealthMetrics(timeRange);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['api-health-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['groq-quota-status'] });
    queryClient.invalidateQueries({ queryKey: ['batch-processing-stats'] });
    refetch();
  };

  const summary = metrics?.summary;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              API Health Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor Groq API performance, quota usage, and system health
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="24h" className="text-xs">24h</TabsTrigger>
                <TabsTrigger value="7d" className="text-xs">7d</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs">30d</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" />
                  Avg Latency
                </div>
                <div className={cn(
                  "text-2xl font-mono font-bold",
                  (summary?.avgLatency || 0) > 500 ? "text-amber-400" : "text-foreground"
                )}>
                  {summary?.avgLatency || 0}ms
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Zap className="w-3 h-3" />
                  Transactions Processed
                </div>
                <div className="text-2xl font-mono font-bold text-foreground">
                  {(summary?.totalProcessed || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  Anomaly Rate
                </div>
                <div className={cn(
                  "text-2xl font-mono font-bold",
                  (summary?.anomalyRate || 0) > 10 ? "text-rose-400" : 
                  (summary?.anomalyRate || 0) > 5 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {summary?.anomalyRate || 0}%
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Efficiency
                </div>
                <div className={cn(
                  "text-2xl font-mono font-bold",
                  (summary?.avgEfficiency || 0) >= 95 ? "text-emerald-400" : 
                  (summary?.avgEfficiency || 0) >= 85 ? "text-amber-400" : "text-rose-400"
                )}>
                  {summary?.avgEfficiency || 100}%
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Real-time Monitors */}
        <div className="grid md:grid-cols-2 gap-6">
          <GroqQuotaMonitor />
          <BatchProcessingMonitor />
        </div>

        {/* Latency Trend Chart */}
        <LatencyTrendChart 
          data={metrics?.latencyTrends || []} 
          isLoading={isLoading}
        />

        {/* Throughput & Circuit Breaker */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Throughput Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Batch Processing Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Batches</div>
                    <div className="text-xl font-mono font-bold text-foreground">
                      {summary?.totalBatches || 0}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Anomalies Detected</div>
                    <div className="text-xl font-mono font-bold text-amber-400">
                      {summary?.totalAnomalies || 0}
                    </div>
                  </div>
                </div>
                
                {/* Daily breakdown */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Daily Throughput</div>
                  {(metrics?.throughputTrends || []).slice(-5).map((day, index) => (
                    <div 
                      key={day.date}
                      className="flex items-center justify-between p-2 bg-muted/20 rounded"
                    >
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-foreground">
                          {day.processed.toLocaleString()} txns
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            day.efficiency >= 95 ? "border-emerald-500/30 text-emerald-400" :
                            day.efficiency >= 85 ? "border-amber-500/30 text-amber-400" :
                            "border-rose-500/30 text-rose-400"
                          )}
                        >
                          {day.efficiency}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Circuit Breaker Timeline */}
          <CircuitBreakerTimeline 
            events={metrics?.circuitEvents || []} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
