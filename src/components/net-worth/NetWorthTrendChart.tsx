import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { NetWorthSnapshot } from '@/hooks/useNetWorthSnapshots';
import { format } from 'date-fns';

interface NetWorthTrendChartProps {
  snapshots: NetWorthSnapshot[];
}

export function NetWorthTrendChart({ snapshots }: NetWorthTrendChartProps) {
  if (snapshots.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Net Worth History</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {snapshots.length === 0 
              ? 'Take your first snapshot to start tracking' 
              : 'Take more snapshots to see trends'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [...snapshots]
    .reverse()
    .map(snapshot => ({
      date: format(new Date(snapshot.snapshot_date), 'MMM d'),
      netWorth: snapshot.net_worth,
      assets: snapshot.total_assets,
      liabilities: snapshot.total_liabilities,
    }));

  const minValue = Math.min(...chartData.map(d => d.netWorth));
  const maxValue = Math.max(...chartData.map(d => d.netWorth));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className={`text-sm ${data.netWorth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            Net Worth: ${data.netWorth.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Assets: ${data.assets.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Liabilities: ${data.liabilities.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-copilot-id="net-worth-trend-chart">
      <CardHeader>
        <CardTitle className="text-lg">Net Worth History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="netWorthGradientPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netWorthGradientNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={[minValue < 0 ? minValue * 1.1 : 0, maxValue * 1.1]}
              />
              <Tooltip content={<CustomTooltip />} />
              {minValue < 0 && maxValue > 0 && (
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              )}
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke={chartData[chartData.length - 1]?.netWorth >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'}
                strokeWidth={2}
                fill={chartData[chartData.length - 1]?.netWorth >= 0 ? 'url(#netWorthGradientPositive)' : 'url(#netWorthGradientNegative)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
