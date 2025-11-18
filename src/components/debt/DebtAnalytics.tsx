import { Card } from '@/components/ui/card';
import { TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtPayment = Database['public']['Tables']['debt_payment_history']['Row'];

interface DebtAnalyticsProps {
  debts: Debt[];
  payments: DebtPayment[];
  userId?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function DebtAnalytics({ debts, payments }: DebtAnalyticsProps) {
  // Debt by type breakdown
  const debtByType = debts.reduce((acc, debt) => {
    const type = debt.debt_type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += Number(debt.current_balance);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(debtByType).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  // Payment history over time
  const paymentHistory = payments
    .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
    .slice(-12) // Last 12 payments
    .map(payment => ({
      date: new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short' }),
      amount: Number(payment.amount),
    }));

  // Interest vs Principal (estimated from payments)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const estimatedInterest = debts.reduce((sum, d) => {
    const monthlyRate = Number(d.interest_rate) / 100 / 12;
    return sum + (Number(d.current_balance) * monthlyRate);
  }, 0) * payments.length;

  if (debts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Add debts to see analytics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Total Paid</h3>
          </div>
          <p className="text-3xl font-bold">${totalPaid.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">Across {payments.length} payments</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Activity className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-semibold">Est. Interest Paid</h3>
          </div>
          <p className="text-3xl font-bold text-destructive">${estimatedInterest.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">Based on current rates</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <PieChartIcon className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-semibold">Debt Types</h3>
          </div>
          <p className="text-3xl font-bold">{Object.keys(debtByType).length}</p>
          <p className="text-sm text-muted-foreground mt-2">Different debt categories</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Debt Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Debt by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={paymentHistory}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
