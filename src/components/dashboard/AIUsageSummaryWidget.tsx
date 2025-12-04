import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUserAIUsageSummary } from '@/hooks/useUserAIUsageSummary';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

type ViewMode = 'daily' | 'weekly';

export function AIUsageSummaryWidget() {
  const { data: usage, isLoading } = useUserAIUsageSummary();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-pulse">
        <CardContent className="p-6 h-48" />
      </Card>
    );
  }

  if (!usage || usage.totalAnalyses === 0) {
    return null;
  }

  const chartData = viewMode === 'daily' ? usage.dailyTrends : usage.weeklyTrends;
  const xKey = viewMode === 'daily' ? 'date' : 'week';

  const formatXAxis = (value: string) => {
    if (viewMode === 'daily') {
      const date = new Date(value);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Working For You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-3xl font-bold text-foreground">
                {usage.totalAnalyses}
              </div>
              <div className="text-xs text-muted-foreground">
                AI analyses this month
              </div>
            </div>
            
            {usage.estimatedSavings > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xl font-bold">
                    ${usage.estimatedSavings}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  estimated saved
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Usage Trends</span>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'daily' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('daily')}
                  aria-pressed={viewMode === 'daily'}
                >
                  Daily
                </Button>
                <Button
                  variant={viewMode === 'weekly' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setViewMode('weekly')}
                  aria-pressed={viewMode === 'weekly'}
                >
                  Weekly
                </Button>
              </div>
            </div>
            
            <div className="h-20" role="img" aria-label={`AI usage ${viewMode} trends chart`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiUsageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey={xKey} 
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    labelFormatter={formatXAxis}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'analyses' ? 'Analyses' : 'Savings ($)'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="analyses"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#aiUsageGradient)"
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Efficiency</span>
              <span className="font-medium text-foreground">
                {usage.efficiencyPercent}%
              </span>
            </div>
            <Progress 
              value={usage.efficiencyPercent} 
              className="h-1.5 bg-muted/30"
              aria-label={`AI efficiency: ${usage.efficiencyPercent}%`}
            />
          </div>

          {/* Feature Breakdown */}
          {usage.featureBreakdown.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Your AI assistant helped with:
              </div>
              <div className="flex flex-wrap gap-2">
                {usage.featureBreakdown.slice(0, 3).map((feature) => (
                  <div
                    key={feature.feature}
                    className="flex items-center gap-1.5 text-xs bg-muted/30 rounded-full px-2.5 py-1"
                  >
                    <span>{feature.icon}</span>
                    <span className="text-muted-foreground">
                      {feature.count} {feature.feature.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/ai-insights">
              Learn how AI helps
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
