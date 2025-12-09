import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IncomeProjection } from '@/hooks/useIncomeAnalytics';

interface IncomeProjectionsProps {
  projections: IncomeProjection[];
  totalMonthly: number;
}

export function IncomeProjections({ projections, totalMonthly }: IncomeProjectionsProps) {
  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">12-Month Projection</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No projection data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate cumulative income for the chart
  const cumulativeData = projections.map((p, index) => ({
    ...p,
    cumulative: (index + 1) * p.projected,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-amber-500">
            Monthly: ${payload[0].payload.projected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">
            Cumulative: ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalAnnual = totalMonthly * 12;

  return (
    <Card data-copilot-id="income-projections">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">12-Month Projection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: ${totalAnnual.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(43, 74%, 49%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
