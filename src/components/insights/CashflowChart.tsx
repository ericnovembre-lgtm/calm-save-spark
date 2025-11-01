import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface CashflowData {
  date: string;
  projected_balance: number;
  income: number;
  spending: number;
  net: number;
}

interface CashflowChartProps {
  data: CashflowData[];
}

export const CashflowChart = ({ data }: CashflowChartProps) => {
  const formattedData = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  }));

  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-xl font-semibold text-foreground mb-4">Cash Flow Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
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
          <Area 
            type="monotone" 
            dataKey="projected_balance" 
            stroke="hsl(var(--primary))" 
            fill="url(#balanceGradient)"
            name="Projected Balance"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
