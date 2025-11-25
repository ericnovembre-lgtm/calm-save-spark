import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";
import { AchievementShareCard } from "@/components/gamification/AchievementShareCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Share2, Sparkles } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RewardCoachNudge } from "@/components/rewards/RewardCoachNudge";
import { StreakProtectorCard } from "@/components/rewards/StreakProtectorCard";
import { QuestlinePanel } from "@/components/rewards/QuestlinePanel";
import { TeamProgressTab } from "@/components/rewards/TeamProgressTab";
import { GeoRewardMap } from "@/components/rewards/GeoRewardMap";
import { WaysToEarn } from "@/components/rewards/WaysToEarn";

export default function Achievements() {
  const prefersReducedMotion = useReducedMotion();

  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: streak } = useQuery({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('streak_type', 'daily_save')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { current_streak: 0, longest_streak: 0 };
    },
  });

  if (achievementsLoading) return <LoadingState />;

  const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || []);
  const totalPoints = userAchievements?.reduce((sum, a) => sum + (a.achievements?.points || 0), 0) || 0;
  const completionRate = allAchievements 
    ? ((userAchievements?.length || 0) / allAchievements.length * 100).toFixed(0)
    : 0;

  const handleShareProgress = () => {
    const text = `I've unlocked ${userAchievements?.length || 0} achievements and earned ${totalPoints} points on $ave+! 🎯`;
    
    if (navigator.share) {
      navigator.share({
        title: '$ave+ Achievements',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Achievement progress copied to clipboard!');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Your Financial Odyssey
            </h1>
            <p className="text-muted-foreground">
              Every streak, boost, and accomplishment—alive in real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareProgress}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Progress
          </Button>
        </motion.div>

        {/* AI Spend Coach Nudge */}
        <RewardCoachNudge />

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <InteractiveCard className="p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{userAchievements?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Unlocked</div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <InteractiveCard className="p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
                    <div className="text-xs text-muted-foreground">Total Points</div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="col-span-2"
            >
              <InteractiveCard className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <span className="text-sm text-muted-foreground">{completionRate}%</span>
                  </div>
                  <AnimatedProgress value={Number(completionRate)} />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span>{allAchievements?.length || 0} total achievements available</span>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>

          {/* Streak Protector */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <StreakProtectorCard />
          </motion.div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="questlines">Questlines</TabsTrigger>
            <TabsTrigger value="team">Team Progress</TabsTrigger>
            <TabsTrigger value="geo-boosters">Geo-Boosters</TabsTrigger>
            <TabsTrigger value="ways-to-earn">Ways to Earn</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Tabs defaultValue="earned" className="space-y-4">
              <TabsList>
                <TabsTrigger value="earned">Earned ({userAchievements?.length || 0})</TabsTrigger>
                <TabsTrigger value="locked">Locked ({(allAchievements?.length || 0) - (userAchievements?.length || 0)})</TabsTrigger>
              </TabsList>

              <TabsContent value="earned" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAchievements?.map((userAch, index) => (
                    <motion.div 
                      key={userAch.id} 
                      className="relative group"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <AchievementBadge
                        name={userAch.achievements?.name || ''}
                        description={userAch.achievements?.description}
                        icon={userAch.achievements?.icon}
                        badgeColor={userAch.achievements?.badge_color}
                        points={userAch.achievements?.points || 0}
                        earnedAt={userAch.earned_at}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AchievementShareCard
                          achievementName={userAch.achievements?.name || ''}
                          achievementDescription={userAch.achievements?.description || ''}
                          points={userAch.achievements?.points || 0}
                          earnedAt={userAch.earned_at}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                {userAchievements?.length === 0 && (
                  <Card className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No achievements yet. Start saving to unlock your first badge!
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="locked" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAchievements
                    ?.filter(ach => !earnedIds.has(ach.id))
                    .map((ach, index) => (
                      <motion.div
                        key={ach.id}
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <AchievementBadge
                          name={ach.name}
                          description={ach.description}
                          icon={ach.icon}
                          badgeColor={ach.badge_color}
                          points={ach.points}
                          locked
                        />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Questlines Tab */}
          <TabsContent value="questlines">
            <QuestlinePanel />
          </TabsContent>

          {/* Team Progress Tab */}
          <TabsContent value="team">
            <TeamProgressTab />
          </TabsContent>

          {/* Geo-Boosters Tab */}
          <TabsContent value="geo-boosters">
            <GeoRewardMap />
          </TabsContent>

          {/* Ways to Earn Tab */}
          <TabsContent value="ways-to-earn">
            <WaysToEarn />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
