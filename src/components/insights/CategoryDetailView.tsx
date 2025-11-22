import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LoadingState } from '@/components/LoadingState';
import { Card } from '@/components/ui/card';
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from '@/components/charts/LazyAreaChart';
import { format, subMonths } from 'date-fns';

interface CategoryDetailViewProps {
  category: string;
  month?: string;
}

export function CategoryDetailView({ category, month }: CategoryDetailViewProps) {
  const prefersReducedMotion = useReducedMotion();

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category-detail', category, month],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const startDate = month 
        ? new Date(month + '-01')
        : subMonths(new Date(), 6);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('category', category)
        .gte('transaction_date', startDate.toISOString())
        .lt('amount', 0)
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData = transactions.reduce((acc: any, t) => {
        const monthKey = format(new Date(t.transaction_date), 'MMM yyyy');
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += Math.abs(t.amount);
        return acc;
      }, {});

      // Merchant breakdown
      const merchantData = transactions.reduce((acc: any, t) => {
        const merchant = t.merchant || 'Unknown';
        if (!acc[merchant]) {
          acc[merchant] = { count: 0, total: 0 };
        }
        acc[merchant].count += 1;
        acc[merchant].total += Math.abs(t.amount);
        return acc;
      }, {});

      return {
        timeSeries: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })),
        merchants: Object.entries(merchantData)
          .map(([name, data]: [string, any]) => ({ name, ...data }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10),
        recentTransactions: transactions.slice(-20).reverse()
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
      {/* Time Series */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {category} Spending Over Time
        </h3>
        <LazyAreaChart data={categoryData?.timeSeries || []} height={250}>
          <defs>
            <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
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
            fill="url(#categoryGradient)"
          />
        </LazyAreaChart>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Merchants */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Merchants</h3>
          <div className="space-y-3">
            {categoryData?.merchants.map((m: any) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.count} transactions</p>
                </div>
                <span className="font-semibold text-foreground">${m.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {categoryData?.recentTransactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(t.transaction_date), 'MMM dd')}</p>
                </div>
                <span className="text-foreground">${Math.abs(t.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
