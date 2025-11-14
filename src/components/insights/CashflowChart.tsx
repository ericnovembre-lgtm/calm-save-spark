import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '@/components/charts/LazyAreaChart';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
  const prefersReducedMotion = useReducedMotion();
  
  const formattedData = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  }));

  return (
    <motion.div 
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-4">Cash Flow Forecast</h3>
      <LazyAreaChart data={formattedData} height={300}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
        />
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
            color: 'hsl(var(--foreground))',
            boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)'
          }}
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              projected_balance: 'Balance',
              income: 'Income',
              spending: 'Spending',
              net: 'Net'
            };
            return [`$${value.toFixed(2)}`, labels[name] || name];
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="projected_balance" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          fill="url(#balanceGradient)"
          name="Projected Balance"
          animationDuration={prefersReducedMotion ? 0 : 1000}
          animationEasing="ease-out"
        />
        <Area 
          type="monotone" 
          dataKey="income" 
          stroke="hsl(var(--accent))" 
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="url(#incomeGradient)"
          name="Income"
          animationDuration={prefersReducedMotion ? 0 : 1200}
          animationEasing="ease-out"
        />
      </LazyAreaChart>
    </motion.div>
  );
};
