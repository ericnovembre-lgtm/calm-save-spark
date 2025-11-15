import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { motion } from "framer-motion";

interface SpendingChartAnimatedProps {
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

export function SpendingChartAnimated({ budgets, spending, categories }: SpendingChartAnimatedProps) {
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
    <ChartWrapper delay={0.2}>
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-6">Spending Breakdown</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
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
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-out"
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
          </div>

          {/* Legend with Details */}
          <div className="space-y-3">
            {spendingData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
    </ChartWrapper>
  );
}
