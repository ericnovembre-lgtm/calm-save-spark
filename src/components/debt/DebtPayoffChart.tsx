import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '@/components/charts/LazyAreaChart';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DebtPayoffChartProps {
  simulation: any[];
  strategy: string;
}

export const DebtPayoffChart = ({ simulation, strategy }: DebtPayoffChartProps) => {
  const prefersReducedMotion = useReducedMotion();
  const chartData = simulation.filter((_, idx) => idx % 3 === 0 || idx === simulation.length - 1);

  return (
    <motion.div 
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]"
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Debt Payoff Timeline ({strategy === 'avalanche' ? 'Avalanche' : 'Snowball'} Method)
      </h3>
      <LazyAreaChart data={chartData} height={300}>
        <defs>
          <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
        />
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
            color: 'hsl(var(--foreground))',
            boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)'
          }}
          formatter={(value: number, name: string) => {
            return [`$${value.toFixed(2)}`, 'Debt Remaining'];
          }}
        />
        <Legend />
        <Area
          type="monotone" 
          dataKey="total_remaining" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          fill="url(#debtGradient)"
          name="Total Debt Remaining"
          animationDuration={prefersReducedMotion ? 0 : 1500}
          animationEasing="ease-in-out"
        />
      </LazyAreaChart>
    </motion.div>
  );
};
