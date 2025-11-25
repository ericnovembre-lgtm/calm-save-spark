import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpendRulesEngine } from './SpendRulesEngine';
import { PointsEarningCard } from './PointsEarningCard';
import { RewardsRedemptionPanel } from './RewardsRedemptionPanel';
import { Gift } from 'lucide-react';
import { useCardTierStatus } from '@/hooks/useCardTierStatus';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface CardRewardsDashboardProps {
  cardId: string;
}

export function CardRewardsDashboard({ cardId }: CardRewardsDashboardProps) {
  const { tierStatus, tierInfo } = useCardTierStatus();

  const progressToNextTier = tierStatus
    ? (tierStatus.total_points / (tierStatus.total_points + (tierStatus.points_to_next_tier || 1))) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Tier Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${tierInfo?.color}`}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{tierInfo?.name} Tier</h3>
              <p className="text-sm text-muted-foreground">
                {tierStatus?.points_to_next_tier
                  ? `${tierStatus.points_to_next_tier.toLocaleString()} points to next tier`
                  : 'Maximum tier reached'}
              </p>
            </div>
          </div>

          {tierStatus?.points_to_next_tier && (
            <div className="space-y-2">
              <Progress value={progressToNextTier} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tierStatus.total_points.toLocaleString()} pts</span>
                <span>{(tierStatus.total_points + tierStatus.points_to_next_tier).toLocaleString()} pts</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Current Benefits</h4>
            <div className="grid grid-cols-2 gap-2">
              {tierInfo?.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Rewards Interface */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="points" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="redeem" className="gap-2">
            <Gift className="w-4 h-4" />
            Redeem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <SpendRulesEngine cardId={cardId} />
        </TabsContent>

        <TabsContent value="points" className="mt-6">
          <PointsEarningCard cardId={cardId} />
        </TabsContent>

        <TabsContent value="redeem" className="mt-6">
          <RewardsRedemptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
