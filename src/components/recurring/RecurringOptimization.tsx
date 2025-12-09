import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, AlertTriangle, DollarSign, ExternalLink } from "lucide-react";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";

interface RecurringOptimizationProps {
  transactions: RecurringTransaction[];
}

interface Optimization {
  type: 'cancel' | 'negotiate' | 'bundle' | 'alternative';
  title: string;
  description: string;
  potentialSavings: number;
  transactions: RecurringTransaction[];
  priority: 'high' | 'medium' | 'low';
}

export function RecurringOptimization({ transactions }: RecurringOptimizationProps) {
  const optimizations = useMemo(() => {
    const result: Optimization[] = [];

    // Find duplicate/similar subscriptions
    const byCategory: Record<string, RecurringTransaction[]> = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(tx);
    });

    // Look for streaming services (multiple in same category)
    const streaming = transactions.filter(tx => 
      tx.category?.toLowerCase().includes('streaming') ||
      tx.category?.toLowerCase().includes('entertainment') ||
      tx.merchant.toLowerCase().includes('netflix') ||
      tx.merchant.toLowerCase().includes('spotify') ||
      tx.merchant.toLowerCase().includes('hulu') ||
      tx.merchant.toLowerCase().includes('disney')
    );

    if (streaming.length > 2) {
      const totalMonthly = streaming.reduce((sum, tx) => sum + Math.abs(tx.avg_amount), 0);
      result.push({
        type: 'bundle',
        title: 'Consolidate Streaming Services',
        description: `You have ${streaming.length} streaming subscriptions. Consider bundling or canceling unused services.`,
        potentialSavings: totalMonthly * 0.3, // Assume 30% savings
        transactions: streaming,
        priority: 'high',
      });
    }

    // High-cost subscriptions
    const highCost = transactions.filter(tx => Math.abs(tx.avg_amount) > 50);
    highCost.forEach(tx => {
      result.push({
        type: 'negotiate',
        title: `Negotiate ${tx.merchant}`,
        description: `At $${Math.abs(tx.avg_amount).toFixed(2)}/month, this is a significant expense. Consider negotiating or finding alternatives.`,
        potentialSavings: Math.abs(tx.avg_amount) * 0.2,
        transactions: [tx],
        priority: Math.abs(tx.avg_amount) > 100 ? 'high' : 'medium',
      });
    });

    // Low confidence might indicate unused subscriptions
    const lowConfidence = transactions.filter(tx => tx.confidence < 0.5);
    if (lowConfidence.length > 0) {
      const totalLowConf = lowConfidence.reduce((sum, tx) => sum + Math.abs(tx.avg_amount), 0);
      result.push({
        type: 'cancel',
        title: 'Review Infrequent Charges',
        description: `${lowConfidence.length} recurring charges appear irregular. They might be unused subscriptions worth reviewing.`,
        potentialSavings: totalLowConf,
        transactions: lowConfidence,
        priority: 'medium',
      });
    }

    return result.sort((a, b) => b.potentialSavings - a.potentialSavings).slice(0, 5);
  }, [transactions]);

  const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);

  const getPriorityStyles = (priority: Optimization['priority']) => {
    switch (priority) {
      case 'high':
        return { badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: 'text-rose-500' };
      case 'medium':
        return { badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: 'text-amber-500' };
      default:
        return { badge: 'bg-muted text-muted-foreground', icon: 'text-muted-foreground' };
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No recurring transactions to optimize</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Savings Summary */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-amber-500/10">
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Potential Monthly Savings</p>
              <p className="text-3xl font-bold text-foreground">
                ${totalPotentialSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-amber-600">
                Up to ${(totalPotentialSavings * 12).toLocaleString('en-US', { minimumFractionDigits: 0 })}/year
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Optimization Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to reduce your recurring expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {optimizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your recurring expenses look optimized!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {optimizations.map((opt, index) => {
                const styles = getPriorityStyles(opt.priority);
                
                return (
                  <motion.div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{opt.title}</h4>
                          <Badge variant="outline" className={styles.badge}>
                            {opt.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {opt.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {opt.transactions.slice(0, 3).map(tx => (
                            <Badge key={tx.id} variant="secondary" className="text-xs">
                              {tx.merchant}
                            </Badge>
                          ))}
                          {opt.transactions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{opt.transactions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-500">
                          ${opt.potentialSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">potential savings</p>
                        <Button size="sm" variant="outline" className="mt-2 gap-1">
                          Take Action
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
