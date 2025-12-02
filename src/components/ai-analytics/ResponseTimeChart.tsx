import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { ResponseTime } from '@/hooks/useAIRoutingAnalytics';

interface Props {
  data: ResponseTime[];
}

const MODEL_NAMES: Record<string, string> = {
  'gemini-flash': 'Gemini Flash',
  'claude-sonnet': 'Claude Sonnet',
  'perplexity': 'Perplexity'
};

export function ResponseTimeChart({ data }: Props) {
  const chartData = data.map(item => ({
    ...item,
    modelName: MODEL_NAMES[item.model] || item.model
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time by Model</CardTitle>
        <CardDescription>
          Average response time in milliseconds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="modelName" type="category" className="text-xs" width={120} />
            <Tooltip 
              formatter={(value: number) => [`${value}ms`, 'Avg Response Time']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="avgResponseMs" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
