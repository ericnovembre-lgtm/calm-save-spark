import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCardPoints } from '@/hooks/useCardPoints';
import { useCardTierStatus } from '@/hooks/useCardTierStatus';
import { Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface PointsEarningCardProps {
  cardId?: string;
}

export function PointsEarningCard({ cardId }: PointsEarningCardProps) {
  const { totalPoints, pointsByType, recentPoints, isLoading } = useCardPoints(cardId);
  const { tierInfo, currentTier } = useCardTierStatus();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  const pointsTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
    base: { label: 'Base', icon: Sparkles, color: 'text-blue-500' },
    category_multiplier: { label: 'Category', icon: TrendingUp, color: 'text-purple-500' },
    discipline_boost: { label: 'Discipline', icon: Award, color: 'text-emerald-500' },
    streak_bonus: { label: 'Streak', icon: Zap, color: 'text-amber-500' },
    milestone: { label: 'Milestone', icon: Award, color: 'text-rose-500' },
    rule_reward: { label: 'Rule', icon: Sparkles, color: 'text-cyan-500' },
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">$ave+ Points</h3>
          <p className="text-sm text-muted-foreground mt-1">Your rewards balance</p>
        </div>
        <Badge className={`bg-gradient-to-r ${tierInfo?.color} text-white`}>
          {tierInfo?.name} • {tierInfo?.pointsMultiplier}x
        </Badge>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-bold tracking-tight">
            <CountUp end={totalPoints} duration={1.5} separator="," />
          </span>
          <span className="text-2xl text-muted-foreground">pts</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Earning at {tierInfo?.pointsMultiplier}x multiplier
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Points by Type</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(pointsByType).map(([type, points], index) => {
            const config = pointsTypeLabels[type];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                  <span className="text-lg font-semibold">
                    {points.toLocaleString()}
                  </span>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {recentPoints.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-sm mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {recentPoints.slice(0, 5).map((entry, index) => {
                const config = pointsTypeLabels[entry.points_type];
                const Icon = config?.icon || Sparkles;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3 h-3 ${config?.color}`} />
                      <span className="text-muted-foreground">
                        {entry.description || config?.label}
                      </span>
                    </div>
                    <span className="font-medium">+{entry.points_amount}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
