import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface IncomeHeroProps {
  totalMonthly: number;
  totalAnnual: number;
  totalMonthlyAfterTax: number;
  sourceCount: number;
}

export function IncomeHero({ 
  totalMonthly, 
  totalAnnual, 
  totalMonthlyAfterTax,
  sourceCount 
}: IncomeHeroProps) {
  const taxAmount = totalMonthly - totalMonthlyAfterTax;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-copilot-id="income-hero"
    >
      <Card className="bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <DollarSign className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Total Income</h2>
                <p className="text-sm text-muted-foreground">
                  {sourceCount} active source{sourceCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Income */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly (Gross)</p>
              <p className="text-3xl font-bold text-foreground">
                $<CountUp end={totalMonthly} decimals={2} duration={1} separator="," />
              </p>
            </div>

            {/* After Tax */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                Monthly (After Tax)
              </p>
              <p className="text-2xl font-semibold text-foreground">
                $<CountUp end={totalMonthlyAfterTax} decimals={2} duration={1} separator="," />
              </p>
              {taxAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  −${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} withheld
                </p>
              )}
            </div>

            {/* Annual Projection */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Annual Projection
              </p>
              <p className="text-2xl font-semibold text-amber-500">
                $<CountUp end={totalAnnual} decimals={0} duration={1.2} separator="," />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
