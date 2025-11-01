import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DebtPayoffChartProps {
  simulation: any[];
  strategy: string;
}

export const DebtPayoffChart = ({ simulation, strategy }: DebtPayoffChartProps) => {
  const chartData = simulation.filter((_, idx) => idx % 3 === 0 || idx === simulation.length - 1);

  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Debt Payoff Timeline ({strategy === 'avalanche' ? 'Avalanche' : 'Snowball'} Method)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total_remaining" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Total Debt Remaining"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
