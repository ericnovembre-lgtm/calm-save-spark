import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ActionClickThrough } from '@/hooks/useWidgetAnalyticsData';

interface ActionClickThroughChartProps {
  data: ActionClickThrough[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

export function ActionClickThroughChart({ data }: ActionClickThroughChartProps) {
  const chartData = data.slice(0, 6).map(a => ({
    name: a.actionName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: a.count,
    widget: a.widgetId,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Action Click-Through</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No action data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Action Click-Through</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} (${Math.round(value / total * 100)}%)`, 'Clicks']}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
