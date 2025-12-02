import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIRoutingAnalytics } from '@/hooks/useAIRoutingAnalytics';
import { TrendingUp, TrendingDown, Zap, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { ModelDistributionChart } from './ModelDistributionChart';
import { DailyTrendsChart } from './DailyTrendsChart';
import { ResponseTimeChart } from './ResponseTimeChart';

export function AIRoutingAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const { data, isLoading } = useAIRoutingAnalytics(timeRange);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">No data available</div>;
  }

  const { modelDistribution, costSavings, dailyTrends, responseTimeByModel, fallbackStats, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Model Analytics</h2>
          <p className="text-muted-foreground">
            Track routing performance and cost optimization
          </p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {summary.totalConversations} conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {costSavings.savingsPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${costSavings.savings.toFixed(2)} saved vs. Claude-only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.avgConfidence * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Routing accuracy score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fallbackStats.fallbackRate}%</div>
            <p className="text-xs text-muted-foreground">
              {fallbackStats.totalFallbacks} fallbacks total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ModelDistributionChart data={modelDistribution} />
        <ResponseTimeChart data={responseTimeByModel} />
      </div>

      <DailyTrendsChart data={dailyTrends} />

      {/* Fallback Analysis */}
      {fallbackStats.topReasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fallback Analysis</CardTitle>
            <CardDescription>
              Top reasons for model fallbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {fallbackStats.topReasons.map((reason, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[120px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}
