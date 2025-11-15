import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";

interface BudgetAnalyticsProps {
  budgets: any[];
  spending: Record<string, any>;
}

export function BudgetAnalytics({ budgets, spending }: BudgetAnalyticsProps) {
  // Mock data for demonstration
  const trendData = [
    { month: 'Jan', budgeted: 3000, spent: 2800 },
    { month: 'Feb', budgeted: 3000, spent: 3100 },
    { month: 'Mar', budgeted: 3000, spent: 2900 },
    { month: 'Apr', budgeted: 3000, spent: 2750 },
    { month: 'May', budgeted: 3000, spent: 2850 },
    { month: 'Jun', budgeted: 3000, spent: 2700 }
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp}>
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-6">Spending Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="budgeted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-6">Budget vs Actual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="budgeted" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="spent" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
