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
import { useGeoRewardRealtime } from "@/hooks/useGeoRewardRealtime";
import { useQuestlineAutoProgress } from "@/hooks/useQuestlineAutoProgress";
import { useQuestlineCelebration } from "@/hooks/useQuestlineCelebration";
import { QuestlineCelebration } from "@/components/rewards/QuestlineCelebration";
import { useGeoRewardProximity } from "@/hooks/useGeoRewardProximity";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function Achievements() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('achievements');

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Enable real-time geo-reward notifications
  useGeoRewardRealtime();
  
  // Enable automatic questline progress tracking
  useQuestlineAutoProgress(session?.user?.id);

  // Questline celebration system
  const { celebrationData, isVisible: isCelebrationVisible, triggerCelebration, dismiss } = useQuestlineCelebration();

  // Real-time proximity tracking for Geo-Boosters
  const geoProximity = useGeoRewardProximity(activeTab === 'geo-boosters');

  // Listen for questline chapter completion events
  useEffect(() => {
    const handleChapterComplete = (event: CustomEvent) => {
      triggerCelebration(event.detail);
    };

    window.addEventListener('questline-chapter-complete', handleChapterComplete as EventListener);
    return () => {
      window.removeEventListener('questline-chapter-complete', handleChapterComplete as EventListener);
    };
  }, [triggerCelebration]);

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

  const triggerConfetti = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#fbbf24', '#f59e0b', '#f97316'],
      ticks: 100,
    });
  };

  return (
    <AppLayout>
      {/* Questline celebration overlay */}
      {celebrationData && (
        <QuestlineCelebration
          isVisible={isCelebrationVisible}
          stepTitle={celebrationData.stepTitle}
          stepPoints={celebrationData.stepPoints}
          questlineName={celebrationData.questlineName}
          category={celebrationData.category}
          isQuestlineComplete={celebrationData.isQuestlineComplete}
          onDismiss={dismiss}
        />
      )}
      
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="space-y-2">
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Financial Odyssey
            </h1>
            <p className="text-lg text-muted-foreground/80">
              Every streak, boost, and accomplishment—alive in real-time
            </p>
          </div>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareProgress}
              className="gap-2 hover:bg-accent/10 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Progress
            </Button>
          </motion.div>
        </motion.div>

        {/* AI Spend Coach Nudge */}
        <RewardCoachNudge />

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <InteractiveCard className="p-6 bg-gradient-to-br from-card to-accent/5 border-accent/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-500/10 ring-1 ring-yellow-500/20">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{userAchievements?.length || 0}</div>
                    <div className="text-xs text-muted-foreground font-medium">Unlocked</div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <InteractiveCard className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{totalPoints}</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Points</div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="col-span-2"
            >
              <InteractiveCard className="p-6 bg-gradient-to-br from-card to-accent/5 border-accent/20 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Completion Progress</span>
                    <span className="text-lg font-bold text-foreground">{completionRate}%</span>
                  </div>
                  <AnimatedProgress value={Number(completionRate)} className="h-2.5" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                    <Target className="w-3.5 h-3.5" />
                    <span>{allAchievements?.length || 0} total achievements available</span>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>

          {/* Streak Protector */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <StreakProtectorCard />
          </motion.div>
        </div>

        {/* Main Tabs */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Tabs defaultValue="achievements" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full h-auto p-1.5 bg-muted/30">
              <TabsTrigger value="achievements" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Achievements
              </TabsTrigger>
              <TabsTrigger value="questlines" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Questlines
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Team Progress
              </TabsTrigger>
              <TabsTrigger value="geo-boosters" className="data-[state=active]:bg-card data-[state=active]:shadow-sm relative">
                Geo-Boosters
                {geoProximity.isTracking && (
                  <MapPin className="w-3 h-3 ml-1.5 text-green-500 animate-pulse absolute -top-0.5 -right-0.5" />
                )}
              </TabsTrigger>
              <TabsTrigger value="ways-to-earn" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Ways to Earn
              </TabsTrigger>
            </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 animate-fade-in">
            <Tabs defaultValue="earned" className="space-y-4">
              <TabsList className="bg-muted/30">
                <TabsTrigger value="earned" className="data-[state=active]:bg-card">
                  Earned ({userAchievements?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="locked" className="data-[state=active]:bg-card">
                  Locked ({(allAchievements?.length || 0) - (userAchievements?.length || 0)})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="earned" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAchievements?.map((userAch, index) => (
                    <motion.div 
                      key={userAch.id} 
                      className="relative group cursor-pointer"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.03, 
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      onClick={triggerConfetti}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    >
                      <AchievementBadge
                        name={userAch.achievements?.name || ''}
                        description={userAch.achievements?.description}
                        icon={userAch.achievements?.icon}
                        badgeColor={userAch.achievements?.badge_color}
                        points={userAch.achievements?.points || 0}
                        earnedAt={userAch.earned_at}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                  <motion.div
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-12 text-center bg-gradient-to-br from-card to-muted/20 border-dashed">
                      <Trophy className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Your Achievement Journey Begins
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Start saving to unlock your first badge and begin building your financial legacy
                      </p>
                    </Card>
                  </motion.div>
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
                        transition={{ 
                          delay: index * 0.03, 
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1]
                        }}
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
          <TabsContent value="questlines" className="animate-fade-in">
            <QuestlinePanel />
          </TabsContent>

          {/* Team Progress Tab */}
          <TabsContent value="team" className="animate-fade-in">
            <TeamProgressTab />
          </TabsContent>

          {/* Geo-Boosters Tab */}
          <TabsContent value="geo-boosters" className="space-y-4 animate-fade-in">
            {geoProximity.isTracking && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        📍 Tracking nearby rewards
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You'll be notified when you're close to active geo-boosters
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            <GeoRewardMap />
          </TabsContent>

          {/* Ways to Earn Tab */}
          <TabsContent value="ways-to-earn" className="animate-fade-in">
            <WaysToEarn />
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
