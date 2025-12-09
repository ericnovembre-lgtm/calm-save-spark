import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sparkles } from 'lucide-react';

interface NetWorthProjectionProps {
  currentNetWorth: number;
  monthlyGrowth: number;
}

export function NetWorthProjection({ currentNetWorth, monthlyGrowth }: NetWorthProjectionProps) {
  const projectionData = useMemo(() => {
    const data = [];
    const now = new Date();
    let projected = currentNetWorth;
    
    // Project 12 months forward
    for (let i = 0; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: i >= 12 ? '2-digit' : undefined }),
        value: Math.round(projected),
        isProjected: i > 0,
      });
      projected += monthlyGrowth;
    }
    
    return data;
  }, [currentNetWorth, monthlyGrowth]);

  const projectedNetWorth = projectionData[projectionData.length - 1]?.value ?? currentNetWorth;
  const projectedGrowth = projectedNetWorth - currentNetWorth;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className={`text-sm ${data.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${data.value.toLocaleString()}
          </p>
          {data.isProjected && (
            <p className="text-xs text-muted-foreground">Projected</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (monthlyGrowth === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            12-Month Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Need more data to project growth
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-copilot-id="net-worth-projection">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          12-Month Projection
        </CardTitle>
        <div className="text-sm">
          <span className="text-muted-foreground">Projected: </span>
          <span className={projectedNetWorth >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
            ${projectedNetWorth.toLocaleString()}
          </span>
          <span className={`text-xs ml-1 ${projectedGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ({projectedGrowth >= 0 ? '+' : ''}{projectedGrowth.toLocaleString()})
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {projectionData.some(d => d.value < 0) && projectionData.some(d => d.value > 0) && (
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(43, 74%, 49%)"
                strokeWidth={2}
                strokeDasharray="0"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (!payload.isProjected) {
                    return (
                      <circle cx={cx} cy={cy} r={4} fill="hsl(43, 74%, 49%)" />
                    );
                  }
                  return (
                    <circle cx={cx} cy={cy} r={3} fill="none" stroke="hsl(43, 74%, 49%)" strokeWidth={2} strokeDasharray="2 2" />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Based on ${Math.abs(monthlyGrowth).toLocaleString()}/month {monthlyGrowth >= 0 ? 'growth' : 'decline'}
        </p>
      </CardContent>
    </Card>
  );
}
