import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/onboarding/AnimatedCounter';

interface DailyPaceCalculatorProps {
  budgetId: string;
  totalLimit: number;
  spentAmount: number;
  periodStart: string;
  periodEnd: string;
}

export function DailyPaceCalculator({
  budgetId,
  totalLimit,
  spentAmount,
  periodStart,
  periodEnd
}: DailyPaceCalculatorProps) {
  const { data: dailyPace } = useQuery({
    queryKey: ['daily-pace', budgetId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('calculate-daily-pace', {
        body: {
          budget_id: budgetId,
          total_limit: totalLimit,
          spent_amount: spentAmount,
          period_start: periodStart,
          period_end: periodEnd
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // Refresh every 15 minutes
  });

  if (!dailyPace) return null;

  const { safe_daily_spend, days_remaining, status } = dailyPace;
  
  const statusConfig = {
    under_pace: {
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: TrendingDown,
      label: 'Under Pace'
    },
    on_pace: {
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: Calendar,
      label: 'On Track'
    },
    over_pace: {
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      icon: TrendingUp,
      label: 'Over Pace'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.on_pace;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {days_remaining} days left
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Safe daily spend</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono tabular-nums ${config.color}`}>$</span>
          <AnimatedCounter
            value={safe_daily_spend}
            className={`text-2xl font-bold font-mono tabular-nums ${config.color}`}
            decimals={2}
          />
          <span className="text-sm text-muted-foreground ml-1">/day</span>
        </div>
      </div>

      {dailyPace.recommendation && (
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          {dailyPace.recommendation}
        </p>
      )}
    </motion.div>
  );
}
