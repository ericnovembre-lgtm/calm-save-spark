import { motion } from 'framer-motion';
import { Brain, Calculator, DollarSign, Zap, TrendingUp, BarChart3, Target, PieChart, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDeepseekMetrics } from '@/hooks/useDeepseekMetrics';
import { cn } from '@/lib/utils';

interface DeepseekMetricsPanelProps {
  timeRange: '24h' | '7d' | '30d';
}

const phase4Icons: Record<string, React.ReactNode> = {
  'optimize-portfolio': <Target className="w-4 h-4" />,
  'retirement-planner': <PieChart className="w-4 h-4" />,
  'optimize-budget-zbb': <Wallet className="w-4 h-4" />,
};

const phase4Colors: Record<string, string> = {
  emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  violet: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
};

export function DeepseekMetricsPanel({ timeRange }: DeepseekMetricsPanelProps) {
  const { data: metrics, isLoading } = useDeepseekMetrics(timeRange);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 animate-pulse">
            <CardContent className="p-6 h-48" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const totalPhase4Queries = metrics.phase4Functions.reduce((sum, f) => sum + f.queryCount, 0);

  return (
    <div className="space-y-6">
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
                <Calculator className="w-3 h-3" />
                Total Queries
              </div>
              <div className="text-2xl font-mono font-bold text-foreground">
                {metrics.totalQueries.toLocaleString()}
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
                <Brain className="w-3 h-3" />
                Reasoning Tokens
              </div>
              <div className="text-2xl font-mono font-bold text-blue-400">
                {metrics.totalReasoningTokens.toLocaleString()}
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
                <Zap className="w-3 h-3" />
                Avg Latency
              </div>
              <div className={cn(
                "text-2xl font-mono font-bold",
                metrics.avgLatency > 2000 ? "text-amber-400" : "text-foreground"
              )}>
                {metrics.avgLatency}ms
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
                <DollarSign className="w-3 h-3" />
                Total Cost
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                ${metrics.totalCost.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Phase 4 Function Breakdown */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Phase 4: Financial Intelligence Functions
            {totalPhase4Queries > 0 && (
              <Badge variant="outline" className="ml-auto font-mono text-xs">
                {totalPhase4Queries} total queries
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPhase4Queries === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No Phase 4 function calls yet
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {metrics.phase4Functions.map((func, index) => (
                <motion.div
                  key={func.functionName}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "p-4 rounded-lg border",
                    phase4Colors[func.color]
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {phase4Icons[func.functionName]}
                    <span className="font-medium text-sm">{func.displayName}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{func.icon} Queries</span>
                      <span className="font-mono font-bold">{func.queryCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">⚡ Avg Latency</span>
                      <span className="font-mono">{func.avgLatency}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">🧠 Reasoning</span>
                      <span className="font-mono">{func.totalReasoningTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">💵 Cost</span>
                      <span className="font-mono font-bold">${func.estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reasoning Token Analysis */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              Reasoning Token Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Avg per Query</div>
                <div className="text-xl font-mono font-bold text-foreground">
                  {metrics.avgReasoningTokensPerQuery.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Reasoning/Completion</div>
                <div className="text-xl font-mono font-bold text-blue-400">
                  {metrics.reasoningToCompletionRatio}x
                </div>
              </div>
            </div>
            
            {/* Token breakdown visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Reasoning Tokens</span>
                <span className="font-mono text-blue-400">{metrics.totalReasoningTokens.toLocaleString()}</span>
              </div>
              <Progress 
                value={metrics.reasoningToCompletionRatio > 0 
                  ? Math.min(100, (metrics.totalReasoningTokens / (metrics.totalReasoningTokens + metrics.totalCompletionTokens)) * 100)
                  : 50} 
                className="h-2 bg-muted/30"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completion Tokens</span>
                <span className="font-mono text-foreground">{metrics.totalCompletionTokens.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Savings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Cost Efficiency vs Claude
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-xs text-emerald-400 mb-1">Total Savings</div>
              <div className="text-3xl font-mono font-bold text-emerald-400">
                ${metrics.costComparison.savings.toFixed(2)}
              </div>
              <div className="text-sm text-emerald-400/80 mt-1">
                {metrics.costComparison.savingsPercentage}% reduction
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Deepseek Cost</span>
                <Badge variant="outline" className="font-mono border-blue-500/30 text-blue-400">
                  ${metrics.costComparison.deepseekCost.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Claude Equivalent</span>
                <Badge variant="outline" className="font-mono border-rose-500/30 text-rose-400">
                  ${metrics.costComparison.claudeEquivalentCost.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query Type Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Query Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.queryTypeDistribution.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No Deepseek queries yet
                </div>
              ) : (
                metrics.queryTypeDistribution.map((item, index) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      className="h-1.5 bg-muted/30"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latency Trends */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Daily Latency Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.latencyTrends.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No latency data yet
                </div>
              ) : (
                metrics.latencyTrends.slice(-7).map((day) => (
                  <div 
                    key={day.date}
                    className="flex items-center justify-between p-2 bg-muted/20 rounded"
                  >
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-foreground">
                        {day.queryCount} queries
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-mono",
                          day.avgLatency <= 1500 ? "border-emerald-500/30 text-emerald-400" :
                          day.avgLatency <= 2500 ? "border-amber-500/30 text-amber-400" :
                          "border-rose-500/30 text-rose-400"
                        )}
                      >
                        {day.avgLatency}ms
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
