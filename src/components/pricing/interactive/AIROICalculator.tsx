import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AIROICalculator() {
  const prefersReducedMotion = useReducedMotion();
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState(3500);
  const [savingsGoal, setSavingsGoal] = useState(10000);

  const monthlySavings = income - expenses;
  const withSavePlus = monthlySavings * 1.25; // 25% boost
  const monthsToGoal = Math.ceil(savingsGoal / withSavePlus);

  const data = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    without: monthlySavings * (i + 1),
    with: withSavePlus * (i + 1),
  }));

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          AI ROI Calculator
        </h3>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="income">Monthly Income</Label>
            <Input
              id="income"
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="expenses">Monthly Expenses</Label>
            <Input
              id="expenses"
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="goal">Savings Goal</Label>
            <Input
              id="goal"
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Results */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Your Potential</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${withSavePlus.toFixed(0)}<span className="text-sm text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Reach goal in {monthsToGoal} months
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="without" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="with" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
