import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Activity, Calendar } from "lucide-react";
import { AccountDetails } from "@/hooks/useAccountDetails";
import { AccountTransaction } from "@/hooks/useAccountTransactions";
import { useMemo } from "react";

interface AccountQuickStatsProps {
  account: AccountDetails;
  transactions: AccountTransaction[];
}

export function AccountQuickStats({ account, transactions }: AccountQuickStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentTx = transactions.filter(
      tx => new Date(tx.transaction_date) >= thirtyDaysAgo
    );

    const income = recentTx
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = recentTx
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const avgDailyBalance = (account.current_balance || account.balance || 0);
    const transactionCount = recentTx.length;

    return {
      income,
      expenses,
      netFlow: income - expenses,
      transactionCount,
      avgDailyBalance,
    };
  }, [transactions, account]);

  const statCards = [
    {
      label: "Income (30d)",
      value: stats.income,
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      prefix: "+$",
    },
    {
      label: "Expenses (30d)",
      value: stats.expenses,
      icon: ArrowUpRight,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      prefix: "-$",
    },
    {
      label: "Net Flow",
      value: Math.abs(stats.netFlow),
      icon: stats.netFlow >= 0 ? TrendingUp : TrendingDown,
      color: stats.netFlow >= 0 ? "text-emerald-500" : "text-rose-500",
      bgColor: stats.netFlow >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      prefix: stats.netFlow >= 0 ? "+$" : "-$",
    },
    {
      label: "Transactions",
      value: stats.transactionCount,
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      prefix: "",
      isCount: true,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color} tabular-nums`}>
                {stat.prefix}
                {stat.isCount 
                  ? stat.value 
                  : stat.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
