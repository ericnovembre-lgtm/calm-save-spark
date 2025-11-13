import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useState } from "react";

export function SpendingChart() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Mock data for demonstration
  const chartData = [
    { category: 'Groceries', amount: 450 },
    { category: 'Dining', amount: 320 },
    { category: 'Transportation', amount: 280 },
    { category: 'Entertainment', amount: 180 },
    { category: 'Utilities', amount: 220 },
    { category: 'Shopping', amount: 380 },
  ];

  // Generate gradient colors based on primary
  const getBarColor = (index: number, isActive: boolean) => {
    if (isActive) return 'hsl(var(--accent))';
    return `hsl(var(--primary) / ${0.7 + (index * 0.05)})`;
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Spending by Category (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              } else {
                setActiveIndex(null);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="category" 
              className="text-xs" 
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              radius={[8, 8, 0, 0]}
              animationDuration={prefersReducedMotion ? 0 : 800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(index, activeIndex === index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}