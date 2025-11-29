import { Card } from "@/components/ui/card";
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "@/components/charts/LazyAreaChart";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface SpendingTrendsChartProps {
  data: { date: string; amount: number }[];
  isLoading?: boolean;
}

export function SpendingTrendsChart({ data, isLoading }: SpendingTrendsChartProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calculate 7-day moving average
  const chartData = data.map((item, index) => {
    const slice = data.slice(Math.max(0, index - 6), index + 1);
    const movingAvg = slice.reduce((sum, d) => sum + d.amount, 0) / slice.length;
    
    return {
      ...item,
      displayDate: format(parseISO(item.date), 'MMM d'),
      movingAverage: movingAvg,
    };
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-md" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Spending Trends</h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No spending data for this period</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Spending Trends</h3>
        <LazyAreaChart data={chartData} height={300}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          <XAxis
            dataKey="displayDate"
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)',
            }}
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name === 'amount' ? 'Daily Spending' : '7-Day Average',
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#spendingGradient)"
            animationDuration={prefersReducedMotion ? 0 : 1000}
          />
          <Area
            type="monotone"
            dataKey="movingAverage"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#avgGradient)"
            animationDuration={prefersReducedMotion ? 0 : 1200}
          />
        </LazyAreaChart>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Daily Spending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-chart-2" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">7-Day Average</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
