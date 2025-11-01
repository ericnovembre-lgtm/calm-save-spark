import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PortfolioAllocationProps {
  accounts: any[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const PortfolioAllocation = ({ accounts }: PortfolioAllocationProps) => {
  const data = accounts.map((acc, idx) => ({
    name: acc.account_name,
    value: parseFloat(String(acc.total_value)),
    color: COLORS[idx % COLORS.length]
  }));

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-xl font-semibold text-foreground mb-4">Portfolio Allocation</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">${item.value.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {((item.value / totalValue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
