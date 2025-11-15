import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface SpendingChartProps {
  budgets: any[];
  spending: Record<string, any>;
  categories: any[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6'
];

export function SpendingChart({ budgets, spending, categories }: SpendingChartProps) {
  const spendingData = budgets
    .map((budget, index) => {
      const spend = spending[budget.id];
      const category = categories.find(c => 
        budget.category_limits && Object.keys(budget.category_limits)[0] === c.code
      );
      
      return {
        name: budget.name,
        value: spend?.spent_amount || 0,
        limit: budget.total_limit,
        color: category?.color || COLORS[index % COLORS.length]
      };
    })
    .filter(item => item.value > 0);

  if (spendingData.length === 0) return null;

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-6">Spending Breakdown</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
                animationDuration={800}
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend with Details */}
        <div className="space-y-3">
          {spendingData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${item.value.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of ${item.limit.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
