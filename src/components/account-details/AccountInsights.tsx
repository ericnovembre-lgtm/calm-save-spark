import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { AccountTransaction } from "@/hooks/useAccountTransactions";
import { useMemo } from "react";

interface AccountInsightsProps {
  accountId: string;
  transactions: AccountTransaction[];
}

interface Insight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  icon: typeof TrendingUp;
}

export function AccountInsights({ accountId, transactions }: AccountInsightsProps) {
  const insights = useMemo(() => {
    const result: Insight[] = [];

    if (transactions.length === 0) {
      return [{
        type: 'info' as const,
        title: 'No Recent Activity',
        description: 'This account has no recent transactions to analyze.',
        icon: Sparkles,
      }];
    }

    // Calculate spending patterns
    const expenses = transactions.filter(tx => tx.amount < 0);
    const income = transactions.filter(tx => tx.amount > 0);
    
    const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);

    // Net flow insight
    if (totalIncome > totalExpenses) {
      result.push({
        type: 'positive',
        title: 'Positive Cash Flow',
        description: `Income exceeds expenses by $${(totalIncome - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })} this period.`,
        icon: TrendingUp,
      });
    } else if (totalExpenses > totalIncome * 1.2) {
      result.push({
        type: 'warning',
        title: 'High Spending',
        description: 'Expenses are significantly higher than income. Consider reviewing your spending.',
        icon: AlertTriangle,
      });
    }

    // Category analysis
    const categorySpend: Record<string, number> = {};
    expenses.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      categorySpend[cat] = (categorySpend[cat] || 0) + Math.abs(tx.amount);
    });

    const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
      result.push({
        type: 'info',
        title: `Top Spending: ${topCategory[0]}`,
        description: `${percentage}% of your expenses ($${topCategory[1].toLocaleString('en-US', { minimumFractionDigits: 2 })}) went to ${topCategory[0]}.`,
        icon: Sparkles,
      });
    }

    // Pending transactions
    const pendingCount = transactions.filter(tx => tx.pending).length;
    if (pendingCount > 0) {
      result.push({
        type: 'info',
        title: `${pendingCount} Pending Transaction${pendingCount > 1 ? 's' : ''}`,
        description: 'Some transactions are still processing and may affect your final balance.',
        icon: Sparkles,
      });
    }

    return result.slice(0, 3); // Limit to 3 insights
  }, [transactions]);

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: 'text-emerald-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: 'text-amber-500',
        };
      default:
        return {
          bg: 'bg-accent/50',
          border: 'border-border',
          icon: 'text-muted-foreground',
        };
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              const Icon = insight.icon;
              
              return (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
                    <div>
                      <h4 className="font-medium text-foreground">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
