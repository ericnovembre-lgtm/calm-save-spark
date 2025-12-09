import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, CreditCard, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface FinancialHealthDashboardProps {
  userId: string;
}

export function FinancialHealthDashboard({ userId }: FinancialHealthDashboardProps) {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['financial-health-dashboard', userId],
    queryFn: async () => {
      const accountsRes = await supabase.from('connected_accounts').select('*').eq('user_id', userId);
      const goalsRes = await supabase.from('goals').select('*').eq('user_id', userId);
      const debtsRes = await supabase.from('debts').select('*').eq('user_id', userId).eq('status', 'active');
      const transactionsRes = await supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(30);

      const totalBalance = accountsRes.data?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
      const totalGoals = goalsRes.data?.length || 0;
      const goalsProgress = goalsRes.data?.reduce((sum, g) => {
        return sum + ((Number(g.current_amount) / Number(g.target_amount)) * 100);
      }, 0) / Math.max(totalGoals, 1);
      
      const totalDebt = debtsRes.data?.reduce((sum, d) => sum + Number(d.current_balance || 0), 0) || 0;
      
      const last30DaysSpending = transactionsRes.data?.reduce((sum, t) => {
        return sum + Math.abs(Number(t.amount || 0));
      }, 0) || 0;

      return {
        totalBalance,
        totalGoals,
        goalsProgress: Math.round(goalsProgress),
        totalDebt,
        monthlySpending: last30DaysSpending,
        savingsRate: totalBalance > 0 ? ((totalBalance / (totalBalance + last30DaysSpending)) * 100) : 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!healthData) return null;

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Balance',
      value: `$${healthData.totalBalance.toLocaleString()}`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      icon: Target,
      label: 'Active Goals',
      value: healthData.totalGoals.toString(),
      detail: `${healthData.goalsProgress}% avg progress`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      icon: CreditCard,
      label: 'Total Debt',
      value: `$${healthData.totalDebt.toLocaleString()}`,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      icon: TrendingUp,
      label: '30-Day Spending',
      value: `$${healthData.monthlySpending.toLocaleString()}`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Financial Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                {metric.detail && (
                  <p className="text-xs text-muted-foreground">{metric.detail}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {healthData.goalsProgress > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Goals Progress</span>
            <span className="text-sm font-bold text-primary">{healthData.goalsProgress}%</span>
          </div>
          <Progress value={healthData.goalsProgress} className="h-2" />
        </Card>
      )}
    </motion.div>
  );
}
