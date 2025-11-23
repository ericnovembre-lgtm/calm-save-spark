import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from 'react-countup';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface CostOfWaitingBadgeProps {
  debts: Debt[];
}

export function CostOfWaitingBadge({ debts }: CostOfWaitingBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const costs = useMemo(() => {
    const oneMonthCost = debts.reduce((total, debt) => {
      const monthlyRate = debt.interest_rate / 100 / 12;
      const monthlyInterest = debt.current_balance * monthlyRate;
      return total + monthlyInterest;
    }, 0);

    return {
      oneMonth: oneMonthCost,
      threeMonths: oneMonthCost * 3,
      oneYear: oneMonthCost * 12,
      perDebt: debts.map(debt => ({
        name: debt.debt_name,
        cost: (debt.current_balance * (debt.interest_rate / 100 / 12))
      }))
    };
  }, [debts]);

  if (debts.length === 0 || costs.oneMonth < 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="p-4 border-2 border-amber-500/30 bg-amber-500/5 cursor-pointer hover:border-amber-500/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            
            <div>
              <p className="text-sm font-semibold text-foreground">
                Cost of Waiting
              </p>
              <p className="text-xs text-muted-foreground">
                Interest accumulates daily
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-500">
                $<CountUp end={costs.oneMonth} decimals={2} duration={0.5} />
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-3">
                {/* Time-based breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">3 Months</p>
                    <p className="text-lg font-bold text-amber-500">
                      ${costs.threeMonths.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">6 Months</p>
                    <p className="text-lg font-bold text-amber-500">
                      ${(costs.oneMonth * 6).toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">1 Year</p>
                    <p className="text-lg font-bold text-amber-500">
                      ${costs.oneYear.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Per-debt breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Monthly Interest by Debt:</p>
                  {costs.perDebt.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{debt.name}</span>
                      <span className="font-semibold text-amber-500">
                        ${debt.cost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
