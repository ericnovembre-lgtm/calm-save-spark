import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface DebtComparisonToolProps {
  debts: Debt[];
}

// National average APRs by debt type (2024 estimates)
const nationalAverages: Record<string, number> = {
  'Credit Card': 24.37,
  'Personal Loan': 12.17,
  'Auto Loan': 7.18,
  'Student Loan': 5.50,
  'Mortgage': 7.50,
  'Medical': 9.00,
  'Other': 15.00
};

interface RefinancingRecommendation {
  debtId: string;
  debtName: string;
  currentAPR: number;
  nationalAverage: number;
  difference: number;
  potentialSavings: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export const DebtComparisonTool = ({ debts }: DebtComparisonToolProps) => {
  const recommendations = useMemo(() => {
    const recs: RefinancingRecommendation[] = [];

    debts.forEach(debt => {
      const nationalAvg = nationalAverages[debt.debt_type] || nationalAverages['Other'];
      const difference = debt.interest_rate - nationalAvg;
      
      // Calculate potential annual savings if refinanced to national average
      const potentialSavings = (debt.current_balance * (debt.interest_rate - nationalAvg)) / 100;

      let recommendation = '';
      let priority: 'high' | 'medium' | 'low' = 'low';

      if (difference > 10) {
        recommendation = '🔥 URGENT: Your rate is significantly above average. Refinancing could save you thousands!';
        priority = 'high';
      } else if (difference > 5) {
        recommendation = '⚠️ Your rate is notably higher than average. Consider refinancing options.';
        priority = 'medium';
      } else if (difference > 2) {
        recommendation = 'Your rate is slightly above average. Refinancing may provide modest savings.';
        priority = 'medium';
      } else if (difference <= 0) {
        recommendation = '✅ Great rate! You\'re at or below the national average.';
        priority = 'low';
      } else {
        recommendation = 'Your rate is near the national average. Monitor for better opportunities.';
        priority = 'low';
      }

      recs.push({
        debtId: debt.id,
        debtName: debt.debt_name,
        currentAPR: debt.interest_rate,
        nationalAverage: nationalAvg,
        difference,
        potentialSavings: Math.max(0, potentialSavings),
        recommendation,
        priority
      });
    });

    return recs.sort((a, b) => b.difference - a.difference);
  }, [debts]);

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);

  if (debts.length === 0) return null;

  return (
    <Card className="p-6 border-2 border-accent/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Debt Comparison Tool</h3>
            <p className="text-sm text-muted-foreground">Compare your rates against national averages</p>
          </div>
        </div>
        {totalPotentialSavings > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-right"
          >
            <p className="text-xs text-muted-foreground">Potential Annual Savings</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${totalPotentialSavings.toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.debtId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 ${
              rec.priority === 'high' 
                ? 'bg-rose-500/5 border-rose-500/30' 
                : rec.priority === 'medium'
                ? 'bg-amber-500/5 border-amber-500/30'
                : 'bg-emerald-500/5 border-emerald-500/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{rec.debtName}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'default'}>
                    {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Review' : 'Good'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Your APR</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold text-foreground">{rec.currentAPR.toFixed(2)}%</p>
                  {rec.difference > 0 && <TrendingUp className="h-4 w-4 text-rose-500" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">National Avg</p>
                <p className="text-lg font-bold text-accent">{rec.nationalAverage.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Difference</p>
                <p className={`text-lg font-bold ${rec.difference > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {rec.difference > 0 ? '+' : ''}{rec.difference.toFixed(2)}%
                </p>
              </div>
            </div>

            {rec.potentialSavings > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-foreground">
                    Potential savings: <span className="text-emerald-600">${rec.potentialSavings.toLocaleString()}/year</span>
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  Explore Options <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Refinancing Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Check your credit score before applying - higher scores get better rates</li>
              <li>Shop around with multiple lenders to compare offers</li>
              <li>Consider balance transfer credit cards for high-interest credit card debt</li>
              <li>Look for promotional 0% APR periods to aggressively pay down principal</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};
