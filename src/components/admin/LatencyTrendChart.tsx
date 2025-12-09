import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { LatencyTrendPoint } from '@/hooks/useApiHealthMetrics';

interface LatencyTrendChartProps {
  data: LatencyTrendPoint[];
  isLoading?: boolean;
}

export function LatencyTrendChart({ data, isLoading }: LatencyTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Latency Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted/30 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Latency Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="p95Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  `${value}ms`,
                  name === 'avgLatency' ? 'Avg Latency' : 'P95 Latency'
                ]}
              />
              <ReferenceLine 
                y={500} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="5 5"
                label={{ 
                  value: '500ms threshold', 
                  position: 'right',
                  fill: 'hsl(var(--warning))',
                  fontSize: 10 
                }}
              />
              <Area
                type="monotone"
                dataKey="p95Latency"
                stroke="hsl(45, 90%, 55%)"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="url(#p95Gradient)"
                name="p95Latency"
              />
              <Area
                type="monotone"
                dataKey="avgLatency"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#latencyGradient)"
                name="avgLatency"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Avg Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-500 rounded" style={{ background: 'hsl(45, 90%, 55%)' }} />
            <span>P95 Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-warning rounded" style={{ opacity: 0.6 }} />
            <span>Threshold (500ms)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
