import { motion } from 'framer-motion';
import { Database, Zap, BarChart3, RefreshCw, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRedisCacheMetrics } from '@/hooks/useRedisCacheMetrics';
import { cn } from '@/lib/utils';

export function RedisCacheMonitor() {
  const { data: metrics, isLoading, refetch } = useRedisCacheMetrics();

  const summary = metrics?.summary;
  const functions = metrics?.functions || [];

  // Function display names
  const functionNames: Record<string, string> = {
    copilot: 'CoPilot Respond',
    permissions: 'Permission Translator',
    'ai-coach': 'AI Coach',
    dashboard: 'Dashboard Layout',
    insights: 'AI Insights',
  };

  // Function icons
  const functionIcons: Record<string, string> = {
    copilot: '🤖',
    permissions: '🔐',
    'ai-coach': '🧠',
    dashboard: '📊',
    insights: '💡',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-400" />
          Redis Cache Monitor
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Target className="w-3 h-3" />
                Hit Rate
              </div>
              <div className={cn(
                "text-2xl font-mono font-bold",
                (summary?.overallHitRate || 0) >= 70 ? "text-emerald-400" :
                (summary?.overallHitRate || 0) >= 40 ? "text-amber-400" : "text-rose-400"
              )}>
                {summary?.overallHitRate || 0}%
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
                Cache Hits
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {(summary?.totalHits || 0).toLocaleString()}
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
                <BarChart3 className="w-3 h-3" />
                Cache Misses
              </div>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {(summary?.totalMisses || 0).toLocaleString()}
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
                <Database className="w-3 h-3" />
                Cached Items
              </div>
              <div className="text-2xl font-mono font-bold text-foreground">
                {(summary?.cachedItems || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Function Breakdown */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Cache Performance by Function
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {functions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No cache data yet. Trigger some AI functions to see metrics.
              </div>
            ) : (
              functions.map((fn, index) => (
                <motion.div
                  key={fn.function}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-muted/30 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{functionIcons[fn.function] || '📦'}</span>
                      <span className="text-sm font-medium text-foreground">
                        {functionNames[fn.function] || fn.function}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-mono",
                        fn.hitRate >= 70 ? "border-emerald-500/30 text-emerald-400" :
                        fn.hitRate >= 40 ? "border-amber-500/30 text-amber-400" :
                        "border-rose-500/30 text-rose-400"
                      )}
                    >
                      {fn.hitRate}% hit rate
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={fn.hitRate} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{fn.hits.toLocaleString()} hits</span>
                    <span>{fn.misses.toLocaleString()} misses</span>
                    <span>{(fn.hits + fn.misses).toLocaleString()} total</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      {metrics?.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
