import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";

interface RecurringCategoryBreakdownProps {
  transactions: RecurringTransaction[];
  onCategoryClick?: (category: string) => void;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(38, 92%, 50%)', // amber
  'hsl(142, 76%, 36%)', // emerald
  'hsl(0, 84%, 60%)', // rose
];

export function RecurringCategoryBreakdown({ transactions, onCategoryClick }: RecurringCategoryBreakdownProps) {
  const categoryData = useMemo(() => {
    const categories: Record<string, { count: number; total: number }> = {};
    
    transactions.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { count: 0, total: 0 };
      }
      
      // Calculate monthly equivalent
      let monthlyAmount = tx.avg_amount;
      if (tx.frequency === 'weekly') monthlyAmount *= 4.33;
      else if (tx.frequency === 'biweekly') monthlyAmount *= 2.17;
      else if (tx.frequency === 'yearly') monthlyAmount /= 12;
      else if (tx.frequency === 'quarterly') monthlyAmount /= 3;
      
      categories[cat].count++;
      categories[cat].total += Math.abs(monthlyAmount);
    });

    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalMonthly = categoryData.reduce((sum, cat) => sum + cat.total, 0);

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No recurring transactions to analyze</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={entry.name} 
                      fill={COLORS[index % COLORS.length]}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onCategoryClick?.(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo`,
                    'Amount'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-2xl font-bold text-foreground">
              ${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">Total Monthly Recurring</p>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => {
              const percentage = (category.total / totalMonthly) * 100;
              
              return (
                <motion.div
                  key={category.name}
                  className="cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors"
                  onClick={() => onCategoryClick?.(category.name)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({category.count} payment{category.count > 1 ? 's' : ''})
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums text-foreground">
                      ${category.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {percentage.toFixed(1)}% of monthly recurring
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
