import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartWrapper } from '@/components/ui/chart-wrapper';
import { 
  useClaudeHealth, 
  useClaudeMetricsStats, 
  useClaudeMetricsTimeSeries,
  useClaudeAgentBreakdown,
  useClaudeMetrics
} from '@/hooks/useClaudeMetrics';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  RefreshCw,
  TrendingUp,
  Zap,
  XCircle,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function ClaudeMonitoring() {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useClaudeHealth();
  const { data: stats, isLoading: statsLoading } = useClaudeMetricsStats(24);
  const { data: timeSeries, isLoading: timeSeriesLoading } = useClaudeMetricsTimeSeries(24);
  const { data: agentBreakdown, isLoading: agentLoading } = useClaudeAgentBreakdown(24);
  const { data: recentErrors } = useClaudeMetrics({ limit: 10, status: 'error' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Claude API Monitoring</h1>
            <p className="text-muted-foreground">Real-time performance and health metrics for Claude integration</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchHealth()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Health Status Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Claude API Health
            </CardTitle>
            <CardDescription>Current status of Claude API connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ) : health ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full ${getStatusColor(health.status)} flex items-center justify-center`}>
                    {getStatusIcon(health.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold capitalize">{health.status}</span>
                      <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                        {health.model}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {format(new Date(health.timestamp), 'PPpp')}
                    </p>
                    {health.error && (
                      <p className="text-sm text-destructive mt-1">{health.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{health.latencyMs}ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Unable to fetch health status</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests (24h)</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.totalRequests.toLocaleString() || 0}</p>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.successRate.toFixed(1) || 0}%</p>
                  )}
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{Math.round(stats?.averageLatency || 0)}ms</p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</p>
                  )}
                </div>
                <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latency Over Time */}
          <ChartWrapper>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Response Time (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeSeriesLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : timeSeries && timeSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(v) => format(new Date(v), 'HH:mm')}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(v) => `${v}ms`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelFormatter={(v) => format(new Date(v), 'PPp')}
                        formatter={(value: number) => [`${value}ms`, 'Avg Latency']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgLatency" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </ChartWrapper>

          {/* Requests by Agent */}
          <ChartWrapper delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Requests by Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : agentBreakdown && agentBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={agentBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis 
                        type="category" 
                        dataKey="agent" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={120}
                        tickFormatter={(v) => v.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="success" stackId="a" fill="hsl(var(--primary))" name="Success" />
                      <Bar dataKey="errors" stackId="a" fill="hsl(var(--destructive))" name="Errors" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </ChartWrapper>
        </div>

        {/* Error & Rate Limit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Errors & Rate Limits (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-destructive/10">
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-destructive">
                    {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.errorCount || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10">
                  <p className="text-sm text-muted-foreground">Rate Limited</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.rateLimitCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentErrors && recentErrors.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentErrors.map((error) => (
                    <div 
                      key={error.id} 
                      className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="text-xs">
                          {error.error_type || 'Error'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(error.created_at), 'PP p')}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground truncate">
                        {error.error_message || 'No error message'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Agent: {error.agent_type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  No recent errors
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Volume Chart */}
        <ChartWrapper delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Request Volume & Token Usage (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : timeSeries && timeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(v) => format(new Date(v), 'HH:mm')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(v) => format(new Date(v), 'PPp')}
                    />
                    <Bar yAxisId="left" dataKey="requests" fill="hsl(var(--primary))" name="Requests" />
                    <Bar yAxisId="right" dataKey="tokens" fill="hsl(var(--secondary))" name="Tokens" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </ChartWrapper>
      </div>
    </AppLayout>
  );
}
