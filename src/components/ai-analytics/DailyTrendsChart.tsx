import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { DailyTrend } from '@/hooks/useAIRoutingAnalytics';

interface Props {
  data: DailyTrend[];
}

export function DailyTrendsChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Query Trends</CardTitle>
        <CardDescription>
          Queries processed per day, stacked by model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="gemini" stackId="a" fill="hsl(var(--chart-3))" name="Gemini Flash" />
            <Bar dataKey="claude" stackId="a" fill="hsl(var(--chart-1))" name="Claude Sonnet" />
            <Bar dataKey="perplexity" stackId="a" fill="hsl(var(--chart-2))" name="Perplexity" />
            <Bar dataKey="groq" stackId="a" fill="hsl(var(--chart-4))" name="Groq LPU" />
            <Bar dataKey="deepseek" stackId="a" fill="hsl(210, 100%, 50%)" name="Deepseek Reasoner" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
