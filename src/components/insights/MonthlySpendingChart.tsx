import { useMemo } from 'react';
import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '@/components/charts/LazyBarChart';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { format, parseISO } from 'date-fns';

interface MonthlyData {
  month: string;
  spending: number;
  budget?: number;
  status: 'under' | 'over' | 'on-track';
}

interface MonthlySpendingChartProps {
  data: MonthlyData[];
  onMonthClick: (month: string) => void;
}

export function MonthlySpendingChart({ data, onMonthClick }: MonthlySpendingChartProps) {
  const prefersReducedMotion = useReducedMotion();

  const formattedData = useMemo(() => 
    data.map(d => ({
      ...d,
      monthLabel: format(parseISO(d.month + '-01'), 'MMM yyyy'),
      fill: d.status === 'over' ? 'hsl(var(--destructive))' : 
            d.status === 'under' ? 'hsl(var(--accent))' : 
            'hsl(var(--primary))'
    })),
    [data]
  );

  return (
    <motion.div
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-4">Monthly Spending</h3>
      <p className="text-sm text-muted-foreground mb-4">Click any bar for detailed breakdown</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <LazyBarChart data={formattedData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="monthLabel" 
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
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
          />
          <Bar 
            dataKey="spending"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
            onClick={(data: any) => onMonthClick(data.month)}
            animationDuration={prefersReducedMotion ? 0 : 1000}
          />
        </LazyBarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent" />
          <span className="text-muted-foreground">Under Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Over Budget</span>
        </div>
      </div>
    </motion.div>
  );
}
