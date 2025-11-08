import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ForecastChart() {
  // Mock forecast data for demonstration
  const chartData = [
    { date: 'Jan 15', predicted: 420, confidence: 85 },
    { date: 'Feb 15', predicted: 450, confidence: 82 },
    { date: 'Mar 15', predicted: 480, confidence: 78 },
    { date: 'Apr 15', predicted: 440, confidence: 80 },
    { date: 'May 15', predicted: 460, confidence: 83 },
    { date: 'Jun 15', predicted: 490, confidence: 79 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">AI Spending Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}