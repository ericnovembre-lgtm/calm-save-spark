import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PriceComparisonChartProps {
  userPrice: number;
  userProvider: string;
  competitors: Array<{ provider: string; price: number }>;
}

export function PriceComparisonChart({ userPrice, userProvider, competitors }: PriceComparisonChartProps) {
  const data = [
    { name: `You (${userProvider})`, price: userPrice, isUser: true },
    ...competitors.slice(0, 3).map(c => ({ name: c.provider, price: c.price, isUser: false }))
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(148, 163, 184, 0.5)"
            angle={-15}
            textAnchor="end"
            height={60}
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(148, 163, 184, 0.5)"
            label={{ value: 'Price ($/mo)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(148, 163, 184, 0.5)' } }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}/mo`, 'Price']}
          />
          <Bar dataKey="price" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isUser ? 'hsl(var(--destructive) / 0.7)' : 'hsl(var(--accent) / 0.7)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}