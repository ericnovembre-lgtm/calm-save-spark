import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";

interface MonteCarloChartProps {
  timeline: Array<{
    year: number;
    age: number;
    median: number;
    p10: number;
    p90: number;
  }>;
}

export function MonteCarloChart({ timeline }: MonteCarloChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Projection Cone</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="year" 
            className="text-xs"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            className="text-xs"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Net Worth', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="p90"
            stroke="hsl(var(--success))"
            fill="hsl(var(--success) / 0.2)"
            name="Optimistic (90th)"
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="hsl(var(--destructive))"
            fill="hsl(var(--destructive) / 0.2)"
            name="Pessimistic (10th)"
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            name="Expected (50th)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success/30" />
          <span className="text-muted-foreground">Optimistic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Expected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive/30" />
          <span className="text-muted-foreground">Pessimistic</span>
        </div>
      </div>
    </Card>
  );
}
