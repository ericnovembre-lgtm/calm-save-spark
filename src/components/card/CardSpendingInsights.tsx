import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCardSpendingInsights } from '@/hooks/useCardSpendingInsights';

interface CardSpendingInsightsProps {
  cardId?: string;
}

export function CardSpendingInsights({ cardId }: CardSpendingInsightsProps) {
  const { data: insights, isLoading } = useCardSpendingInsights(cardId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6 mb-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${insights.totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{insights.transactionCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">${insights.avgTransactionAmount.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {insights.categoryBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {insights.categoryBreakdown.slice(0, 5).map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Merchants */}
      {insights.topMerchants.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Merchants</h3>
          <div className="space-y-2">
            {insights.topMerchants.slice(0, 5).map((merchant, index) => (
              <motion.div
                key={merchant.merchant}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{merchant.merchant}</p>
                    <p className="text-xs text-muted-foreground">{merchant.count} transactions</p>
                  </div>
                </div>
                <p className="font-semibold">${merchant.amount.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
