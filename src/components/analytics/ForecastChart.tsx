import { Card } from "@/components/ui/card";
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyLineChart";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ForecastChart() {
  const prefersReducedMotion = useReducedMotion();

  // Mock forecast data for demonstration
  const chartData = [
    { date: 'Jan 15', predicted: 420, confidence: 85, lower: 380, upper: 460 },
    { date: 'Feb 15', predicted: 450, confidence: 82, lower: 405, upper: 495 },
    { date: 'Mar 15', predicted: 480, confidence: 78, lower: 432, upper: 528 },
    { date: 'Apr 15', predicted: 440, confidence: 80, lower: 396, upper: 484 },
    { date: 'May 15', predicted: 460, confidence: 83, lower: 414, upper: 506 },
    { date: 'Jun 15', predicted: 490, confidence: 79, lower: 441, upper: 539 },
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">AI Spending Forecast</h3>
        <LazyLineChart data={chartData} height={300}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'predicted') return [`$${value.toFixed(2)}`, 'Predicted'];
              if (name === 'confidence') return [`${value}%`, 'Confidence'];
              return [`$${value.toFixed(2)}`, name];
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ 
              fill: 'hsl(var(--primary))', 
              r: 5,
              strokeWidth: 2,
              stroke: 'hsl(var(--background))'
            }}
            activeDot={{ 
              r: 7, 
              fill: 'hsl(var(--accent))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2
            }}
            animationDuration={prefersReducedMotion ? 0 : 1000}
            animationEasing="ease-in-out"
          />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={prefersReducedMotion ? 0 : 1200}
            animationEasing="ease-in-out"
          />
        </LazyLineChart>
      </Card>
    </motion.div>
  );
}