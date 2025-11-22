import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LoadingState } from '@/components/LoadingState';
import { Card } from '@/components/ui/card';
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from '@/components/charts/LazyAreaChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyDetailViewProps {
  month: string;
  onCategoryClick: (category: string) => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(var(--destructive))',
  'hsl(var(--muted))',
];

export function MonthlyDetailView({ month, onCategoryClick }: MonthlyDetailViewProps) {
  const prefersReducedMotion = useReducedMotion();

  const { data: monthData, isLoading } = useQuery({
    queryKey: ['monthly-detail', month],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const monthStart = startOfMonth(new Date(month + '-01'));
      const monthEnd = endOfMonth(monthStart);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('transaction_date', monthStart.toISOString())
        .lte('transaction_date', monthEnd.toISOString())
        .lt('amount', 0);

      if (error) throw error;

      // Group by day
      const dailyData = transactions.reduce((acc: any, t) => {
        const day = format(new Date(t.transaction_date), 'MMM dd');
        if (!acc[day]) acc[day] = 0;
        acc[day] += Math.abs(t.amount);
        return acc;
      }, {});

      // Group by category
      const categoryData = transactions.reduce((acc: any, t) => {
        const cat = t.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += Math.abs(t.amount);
        return acc;
      }, {});

      return {
        daily: Object.entries(dailyData).map(([day, amount]) => ({ day, amount })),
        categories: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
        transactions: transactions
          .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
          .slice(0, 10)
      };
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <motion.div
      className="space-y-6"
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Spending */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Spending</h3>
          <LazyAreaChart data={monthData?.daily || []} height={250}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)"
            />
          </LazyAreaChart>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={monthData?.categories || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
                onClick={(data) => onCategoryClick(data.name)}
                cursor="pointer"
              >
                {monthData?.categories.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Transactions</h3>
        <div className="space-y-2">
          {monthData?.transactions.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors">
              <div>
                <p className="font-medium text-foreground">{t.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(t.transaction_date), 'MMM dd, yyyy')} • {t.category}
                </p>
              </div>
              <span className="font-semibold text-foreground">${Math.abs(t.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
