import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsHeroCard } from "@/components/rewards/RewardsHeroCard";
import { RewardsPointsBreakdown } from "@/components/rewards/RewardsPointsBreakdown";
import { RewardsRedemptionGrid } from "@/components/rewards/RewardsRedemptionGrid";
import { WaysToEarn } from "@/components/rewards/WaysToEarn";
import { GeoRewardMap } from "@/components/rewards/GeoRewardMap";
import { QuestlinePanel } from "@/components/rewards/QuestlinePanel";
import { StreakProtectorCard } from "@/components/rewards/StreakProtectorCard";
import { RewardsHistoryList } from "@/components/rewards/RewardsHistoryList";
import { Gift, Sparkles, BookOpen, History } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCardTierStatus } from "@/hooks/useCardTierStatus";
import { useCardPoints } from "@/hooks/useCardPoints";
import { Skeleton } from "@/components/ui/skeleton";

export default function Rewards() {
  const prefersReducedMotion = useReducedMotion();
  const { tierStatus, currentTier, isLoading: tierLoading } = useCardTierStatus();
  const { totalPoints, pointsByType, recentPoints, isLoading: pointsLoading } = useCardPoints();

  const isLoading = tierLoading || pointsLoading;

  // Calculate tier progress
  const tierOrder = ['basic', 'growth', 'prestige', 'elite_legacy'];
  const currentTierIndex = tierOrder.indexOf(currentTier);
  const nextTier = currentTierIndex < tierOrder.length - 1 
    ? tierOrder[currentTierIndex + 1] 
    : currentTier;
  
  const pointsToNextTier = tierStatus?.points_to_next_tier || 0;
  const lifetimePoints = tierStatus?.lifetime_points || 0;
  
  // Calculate progress percentage (simplified)
  const tierThresholds: Record<string, number> = {
    basic: 0,
    growth: 1000,
    prestige: 5000,
    elite_legacy: 15000,
  };
  const currentThreshold = tierThresholds[currentTier] || 0;
  const nextThreshold = tierThresholds[nextTier] || currentThreshold + 1000;
  const tierProgress = nextTier === currentTier 
    ? 100 
    : Math.min(100, ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  // Format tier name for display
  const formatTierName = (tier: string) => {
    return tier.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[hsl(var(--orbital-bg))]">
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Your Rewards
            </h1>
            <p className="text-muted-foreground">
              Earn, track, and redeem your $ave+ rewards
            </p>
          </motion.div>

          {/* Hero Card */}
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <RewardsHeroCard
              totalPoints={tierStatus?.total_points || 0}
              tier={formatTierName(currentTier)}
              tierProgress={tierProgress}
              pointsToNextTier={pointsToNextTier}
              nextTier={formatTierName(nextTier)}
              monthlyPoints={recentPoints.reduce((sum, p) => sum + p.points_amount, 0)}
              multiplier={currentTier === 'elite_legacy' ? 2.0 : currentTier === 'prestige' ? 1.5 : currentTier === 'growth' ? 1.25 : 1.0}
            />
          )}

          {/* Points Breakdown */}
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : (
            <RewardsPointsBreakdown pointsByType={pointsByType} />
          )}

          {/* Tabbed Content */}
          <Tabs defaultValue="redeem" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-2xl h-auto">
              <TabsTrigger 
                value="redeem"
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Redeem</span>
              </TabsTrigger>
              <TabsTrigger 
                value="earn"
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Earn</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quests"
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Quests</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="redeem" className="space-y-6 mt-6">
              <RewardsRedemptionGrid availablePoints={tierStatus?.total_points || 0} />
            </TabsContent>

            <TabsContent value="earn" className="space-y-8 mt-6">
              <WaysToEarn />
              <GeoRewardMap />
            </TabsContent>

            <TabsContent value="quests" className="space-y-6 mt-6">
              <StreakProtectorCard />
              <QuestlinePanel />
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-6">
              <RewardsHistoryList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
