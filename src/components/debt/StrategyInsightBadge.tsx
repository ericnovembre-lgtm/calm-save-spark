import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StrategyInsightBadgeProps {
  avalancheSummary?: any;
  snowballSummary?: any;
  currentStrategy: 'avalanche' | 'snowball';
}

export function StrategyInsightBadge({ 
  avalancheSummary, 
  snowballSummary,
  currentStrategy 
}: StrategyInsightBadgeProps) {
  const insight = useMemo(() => {
    if (!avalancheSummary?.total_interest_paid || !snowballSummary?.total_interest_paid) {
      return null;
    }

    const avalancheInterest = avalancheSummary.total_interest_paid;
    const snowballInterest = snowballSummary.total_interest_paid;
    const difference = Math.abs(avalancheInterest - snowballInterest);
    
    if (difference < 50) {
      return {
        message: 'Both strategies are nearly equal in cost',
        savings: 0,
        betterStrategy: null,
        isSignificant: false
      };
    }

    const betterStrategy = avalancheInterest < snowballInterest ? 'avalanche' : 'snowball';
    const isCurrent = betterStrategy === currentStrategy;

    return {
      message: isCurrent 
        ? `You're using the optimal strategy! Saves you $${difference.toFixed(0)} in interest`
        : `Switching to ${betterStrategy === 'avalanche' ? 'Avalanche' : 'Snowball'} will save you $${difference.toFixed(0)} in interest`,
      savings: difference,
      betterStrategy,
      isSignificant: difference > 500,
      isCurrent
    };
  }, [avalancheSummary, snowballSummary, currentStrategy]);

  if (!insight || insight.savings === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          'p-4 border-2',
          insight.isCurrent 
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : insight.isSignificant 
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-primary/30 bg-primary/5'
        )}
      >
        <motion.div
          animate={insight.isSignificant && !insight.isCurrent ? {
            boxShadow: [
              '0 0 0px rgba(245, 158, 11, 0)',
              '0 0 20px rgba(245, 158, 11, 0.3)',
              '0 0 0px rgba(245, 158, 11, 0)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-3"
        >
          <div className={cn(
            'p-2 rounded-lg',
            insight.isCurrent 
              ? 'bg-emerald-500/20'
              : 'bg-amber-500/20'
          )}>
            {insight.isCurrent ? (
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            ) : (
              <Lightbulb className="w-5 h-5 text-amber-500" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {insight.message}
            </p>
            {insight.isSignificant && !insight.isCurrent && (
              <p className="text-xs text-muted-foreground mt-1">
                That's significant savings! Consider switching strategies.
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-500">
              ${insight.savings.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">saved</p>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
