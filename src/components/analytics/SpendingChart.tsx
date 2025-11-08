import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function SpendingChart() {
  // Mock data for demonstration
  const chartData = [
    { category: 'Groceries', amount: 450 },
    { category: 'Dining', amount: 320 },
    { category: 'Transportation', amount: 280 },
    { category: 'Entertainment', amount: 180 },
    { category: 'Utilities', amount: 220 },
    { category: 'Shopping', amount: 380 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Spending by Category (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="category" className="text-xs" />
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
          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}