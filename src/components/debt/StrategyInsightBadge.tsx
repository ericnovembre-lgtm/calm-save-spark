import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown, Flame, Zap, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface StrategyInsightBadgeProps {
  debts: Debt[];
  avalancheSummary?: any;
  snowballSummary?: any;
  currentStrategy: 'avalanche' | 'snowball';
}

export function StrategyInsightBadge({ 
  debts,
  avalancheSummary, 
  snowballSummary,
  currentStrategy 
}: StrategyInsightBadgeProps) {
  // AI-powered insight
  const { data: aiInsight, isLoading } = useQuery({
    queryKey: ['debt-strategy-insight', debts, avalancheSummary, snowballSummary, currentStrategy],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-debt-strategy', {
        body: {
          debts: debts.map(d => ({
            debt_name: d.debt_name,
            current_balance: d.current_balance,
            interest_rate: d.interest_rate,
            debt_type: d.debt_type,
            minimum_payment: d.minimum_payment
          })),
          avalancheSummary,
          snowballSummary,
          currentStrategy
        }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!avalancheSummary && !!snowballSummary && debts.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fallback static calculation
  const staticInsight = useMemo(() => {
    if (!avalancheSummary?.total_interest_paid || !snowballSummary?.total_interest_paid) {
      return null;
    }

    const avalancheInterest = avalancheSummary.total_interest_paid;
    const snowballInterest = snowballSummary.total_interest_paid;
    const difference = Math.abs(avalancheInterest - snowballInterest);
    
    if (difference < 50) return null;

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

  // Use AI insight if available, otherwise fall back to static
  const insight = aiInsight || staticInsight;
  const isAiPowered = !!aiInsight;

  if (!insight && !isLoading) return null;

  // Urgency icon based on level
  const getUrgencyIcon = (level?: string) => {
    switch (level) {
      case 'high': return <Flame className="w-5 h-5 text-destructive" />;
      case 'medium': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'low': return <Lightbulb className="w-5 h-5 text-primary" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const isCurrent = insight?.recommended_strategy === currentStrategy || insight?.isCurrent;
  const isSignificant = (insight?.urgency_level === 'high') || insight?.isSignificant;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          'p-4 border-2',
          isLoading && 'animate-pulse',
          isCurrent 
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : isSignificant 
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-primary/30 bg-primary/5'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ) : (
          <motion.div
            animate={isSignificant && !isCurrent ? {
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
              isCurrent 
                ? 'bg-emerald-500/20'
                : isSignificant
                  ? 'bg-amber-500/20'
                  : 'bg-primary/20'
            )}>
              {isCurrent ? (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              ) : (
                getUrgencyIcon(insight?.urgency_level)
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {insight?.insight_message || insight?.message}
              </p>
              {isAiPowered && insight?.highlighted_debt && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                >
                  Focus: {insight.highlighted_debt}
                </motion.span>
              )}
              {isSignificant && !isCurrent && !isAiPowered && (
                <p className="text-xs text-muted-foreground mt-1">
                  That's significant savings! Consider switching strategies.
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-500">
                ${(insight?.savings_amount || insight?.savings || 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">saved</p>
              {isAiPowered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-end gap-1 mt-1"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">AI</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
