import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

export default function Achievements() {
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

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: challengeProgress } = useQuery({
    queryKey: ['challenge-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*, challenges(*)');
      
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Achievements & Challenges
          </h1>
          <p className="text-muted-foreground">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{userAchievements?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-10 h-10 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm text-muted-foreground">{completionRate}%</span>
              </div>
              <Progress value={Number(completionRate)} className="h-2" />
            </div>
          </Card>
        </div>

        {/* Streak */}
        {streak && (
          <StreakDisplay 
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="earned" className="space-y-6">
          <TabsList>
            <TabsTrigger value="earned">Earned ({userAchievements?.length || 0})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({(allAchievements?.length || 0) - (userAchievements?.length || 0)})</TabsTrigger>
            <TabsTrigger value="challenges">Challenges ({challenges?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements?.map((userAch) => (
                <AchievementBadge
                  key={userAch.id}
                  name={userAch.achievements?.name || ''}
                  description={userAch.achievements?.description}
                  icon={userAch.achievements?.icon}
                  badgeColor={userAch.achievements?.badge_color}
                  points={userAch.achievements?.points || 0}
                  earnedAt={userAch.earned_at}
                />
              ))}
            </div>
            {userAchievements?.length === 0 && (
              <Card className="p-8 text-center">
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
                .map((ach) => (
                  <AchievementBadge
                    key={ach.id}
                    name={ach.name}
                    description={ach.description}
                    icon={ach.icon}
                    badgeColor={ach.badge_color}
                    points={ach.points}
                    locked
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            {challenges?.map((challenge) => {
              const progress = challengeProgress?.find(p => p.challenge_id === challenge.id);
              const requirement = challenge.requirement as any;
              const progressPercent = progress 
                ? Math.min((Number(progress.progress) / (requirement?.days || requirement?.goals || requirement?.transactions || 1)) * 100, 100)
                : 0;

              return (
                <Card key={challenge.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">{challenge.points} pts</div>
                      {progress?.completed && (
                        <div className="text-xs text-green-600 mt-1">✓ Completed</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {progressPercent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}