import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  amount: number;
}

interface AnimatedProgressChartProps {
  data: DataPoint[];
  target: number;
}

/**
 * Animated line chart showing goal progress over time
 */
export const AnimatedProgressChart = ({ data, target }: AnimatedProgressChartProps) => {
  return (
    <motion.div
      className="w-full h-64 p-4 rounded-2xl bg-card border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          
          {/* Target line */}
          <Line
            type="monotone"
            dataKey={() => target}
            stroke="hsl(var(--muted))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />

          {/* Progress line */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#progressGradient)"
            strokeWidth={3}
            dot={{
              fill: 'hsl(var(--primary))',
              strokeWidth: 2,
              r: 4
            }}
            activeDot={{
              r: 6,
              fill: 'hsl(var(--primary))'
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
