import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, RefreshCw, AlertTriangle, Brain } from 'lucide-react';
import { WithdrawalStrategy } from '@/hooks/useRetirementPlanner';

interface WithdrawalStrategyPanelProps {
  strategy?: WithdrawalStrategy;
  isLoading?: boolean;
}

export function WithdrawalStrategyPanel({ strategy, isLoading }: WithdrawalStrategyPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Calculate your retirement plan to see withdrawal strategy</p>
      </Card>
    );
  }

  const accountColors: Record<string, string> = {
    traditional: 'bg-amber-500',
    taxable: 'bg-green-500',
    roth: 'bg-yellow-500',
  };

  const accountLabels: Record<string, string> = {
    traditional: 'Traditional 401(k)/IRA',
    taxable: 'Taxable Brokerage',
    roth: 'Roth IRA',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Withdrawal Strategy</h3>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Brain className="w-3 h-3 mr-1" />
          AI Optimized
        </Badge>
      </div>

      {/* Safe Withdrawal Rate */}
      <Card className="p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Safe Withdrawal Rate</p>
            <p className="text-3xl font-bold text-green-500">{strategy.safeWithdrawalRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Based on your risk profile</p>
            <p className="text-xs text-muted-foreground mt-1">Adjusted for sequence of returns risk</p>
          </div>
        </div>
      </Card>

      {/* Optimal Withdrawal Sequence */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Optimal Withdrawal Sequence</p>
        <div className="flex items-center gap-2">
          {strategy.optimalSequence.map((account, index) => (
            <motion.div
              key={account}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`px-3 py-2 rounded-lg ${accountColors[account]} text-white text-sm font-medium`}>
                {index + 1}. {accountLabels[account] || account}
              </div>
              {index < strategy.optimalSequence.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Withdraw from taxable first to allow tax-advantaged accounts to grow
        </p>
      </div>

      {/* First Year Withdrawals */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">First Year Retirement Withdrawals</p>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(strategy.firstYearWithdrawals).map(([account, amount], index) => (
            <motion.div
              key={account}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-3">
                <div className={`w-2 h-2 rounded-full ${accountColors[account]} mb-2`} />
                <p className="text-xs text-muted-foreground">{accountLabels[account] || account}</p>
                <p className="text-lg font-semibold">${amount.toLocaleString()}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Roth Conversion Opportunity */}
      {strategy.rothConversionOpportunity && strategy.rothConversionOpportunity.recommendedAmount > 0 && (
        <Card className="p-4 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/20 mb-6">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Roth Conversion Opportunity</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consider converting ${strategy.rothConversionOpportunity.recommendedAmount.toLocaleString()}/year
                from Traditional to Roth IRA
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Potential Tax Savings</p>
                  <p className="font-semibold text-green-500">
                    ${strategy.rothConversionOpportunity.taxSavings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Optimal Years</p>
                  <p className="font-semibold">
                    Ages {strategy.rothConversionOpportunity.optimalYears.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* RMD Projections */}
      {strategy.rmdProjections && strategy.rmdProjections.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium">Required Minimum Distributions</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {strategy.rmdProjections.slice(0, 4).map((rmd, index) => (
              <Card key={rmd.age} className="p-3 bg-amber-500/5 border-amber-500/20">
                <p className="text-xs text-muted-foreground">Age {rmd.age}</p>
                <p className="font-semibold">${rmd.amount.toLocaleString()}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            RMDs begin at age 73 and increase annually
          </p>
        </div>
      )}
    </Card>
  );
}
