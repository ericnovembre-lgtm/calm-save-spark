import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface IncomeTrendsProps {
  totalMonthly: number;
}

export function IncomeTrends({ totalMonthly }: IncomeTrendsProps) {
  // Generate mock historical data based on current monthly income
  // In a real app, this would come from historical income records
  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Add some variance to simulate real data (±10%)
      const variance = i === 0 ? 0 : (Math.random() - 0.5) * 0.2;
      const amount = totalMonthly * (1 + variance);
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: Math.round(amount),
      });
    }
    
    return months;
  }, [totalMonthly]);

  const avgIncome = trendData.reduce((sum, d) => sum + d.amount, 0) / trendData.length;
  const trend = totalMonthly > avgIncome ? 'up' : totalMonthly < avgIncome ? 'down' : 'stable';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-amber-500">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalMonthly === 0) {
    return null;
  }

  return (
    <Card data-copilot-id="income-trends">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Income Trends
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          12-month avg: ${Math.round(avgIncome).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="incomeTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(43, 74%, 49%)"
                strokeWidth={2}
                fill="url(#incomeTrendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
