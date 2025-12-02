import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import type { ModelDistribution } from '@/hooks/useAIRoutingAnalytics';

interface Props {
  data: ModelDistribution[];
}

export function ModelDistributionChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Distribution</CardTitle>
        <CardDescription>
          Breakdown of queries by AI model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="modelName"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value} queries (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.modelName,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
