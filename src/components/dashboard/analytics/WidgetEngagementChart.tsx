import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type WidgetEngagement } from '@/hooks/useWidgetAnalyticsData';

interface WidgetEngagementChartProps {
  data: WidgetEngagement[];
}

const WIDGET_LABELS: Record<string, string> = {
  balance_hero: 'Balance',
  goal_progress: 'Goals',
  spending_breakdown: 'Spending',
  credit_score: 'Credit',
  portfolio: 'Portfolio',
  upcoming_bills: 'Bills',
  ai_insights: 'AI Insights',
  debt_tracker: 'Debts',
  subscriptions: 'Subscriptions',
  net_worth_chart: 'Net Worth',
};

export function WidgetEngagementChart({ data }: WidgetEngagementChartProps) {
  const chartData = data
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)
    .map(w => ({
      name: WIDGET_LABELS[w.widgetId] || w.widgetId.replace(/_/g, ' '),
      views: w.viewCount,
      clicks: w.clickCount,
      avgDuration: Math.round(w.avgDurationMs / 1000),
    }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Most Viewed Widgets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} 
                width={75}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'avgDuration' ? `${value}s` : value,
                  name === 'views' ? 'Views' : name === 'clicks' ? 'Clicks' : 'Avg Duration'
                ]}
              />
              <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fillOpacity={1 - index * 0.08} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
