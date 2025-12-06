import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Flame, Users, Calendar, LayoutDashboard } from 'lucide-react';
import { GamificationHero } from '@/components/gamification/GamificationHero';
import { GamificationOverview } from '@/components/gamification/GamificationOverview';
import { LeaderboardPodium } from '@/components/gamification/LeaderboardPodium';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { ChallengesGrid } from '@/components/social/ChallengesGrid';
import { WeeklyRecap } from '@/components/gamification/WeeklyRecap';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  points: number;
  badge_color: string | null;
  achievement_type: string;
  requirement: Json;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  achievements: Achievement | null;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  rank_change?: number;
}

export default function Gamification() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    async function fetchData() {
      try {
        // Fetch all achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*');
        
        if (allAchievements) {
          setAchievements(allAchievements as Achievement[]);
        }

        // Fetch user achievements
        const { data: userAch } = await supabase
          .from('user_achievements')
          .select('id, achievement_id, earned_at, achievements(*)')
          .eq('user_id', session.user.id);
        
        if (userAch) {
          setUserAchievements(userAch as unknown as UserAchievement[]);
          const points = userAch.reduce((sum, ua) => {
            const ach = ua.achievements as unknown as Achievement | null;
            return sum + (ach?.points || 0);
          }, 0);
          setTotalPoints(points);
        }

        // Fetch user streak
        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', session.user.id)
          .single();
        
        if (streak) {
          setUserStreak(streak.current_streak || 0);
          setLongestStreak(streak.longest_streak || 0);
        }

        // Fetch leaderboard
        const { data: leaderboardData } = await supabase
          .from('leaderboard_entries')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);
        
        if (leaderboardData) {
          setLeaderboard(leaderboardData.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            display_name: entry.display_name || 'Anonymous',
          })));
        }
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.id]);

  // Calculate tier based on points
  const getTier = (points: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' => {
    if (points >= 10000) return 'diamond';
    if (points >= 5000) return 'platinum';
    if (points >= 2000) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  };

  const getRankName = (tier: string): string => {
    const ranks: Record<string, string> = {
      bronze: 'Bronze Saver',
      silver: 'Silver Saver',
      gold: 'Gold Saver',
      platinum: 'Platinum Saver',
      diamond: 'Diamond Saver',
    };
    return ranks[tier] || 'Saver';
  };

  const getNextRankPoints = (tier: string): number | undefined => {
    const thresholds: Record<string, number> = {
      bronze: 500,
      silver: 2000,
      gold: 5000,
      platinum: 10000,
    };
    return thresholds[tier];
  };

  const tier = getTier(totalPoints);
  const rankName = getRankName(tier);
  const nextRankPoints = getNextRankPoints(tier);

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const recentUnlocks = userAchievements
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 5)
    .map(ua => ({
      id: ua.id,
      name: ua.achievements?.name || 'Achievement',
      icon: ua.achievements?.icon || '🏆',
      earned_at: ua.earned_at,
      points: ua.achievements?.points || 0,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Rewards & Progress
          </h1>
          <p className="text-muted-foreground">
            Track your achievements, compete with others, and celebrate your wins
          </p>
        </motion.div>

        {/* Hero Section */}
        <GamificationHero
          totalPoints={totalPoints}
          currentStreak={userStreak}
          rank={rankName}
          tier={tier}
          achievementCount={userAchievements.length}
          nextRankPoints={nextRankPoints}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-background/50 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 rounded-lg">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2 rounded-lg">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2 rounded-lg">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="gap-2 rounded-lg">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="m-0">
              <GamificationOverview
                recentUnlocks={recentUnlocks}
                activeChallenges={[]}
                weeklyInsightsSummary="You're on track! Keep up the great savings habit."
                totalSavedThisWeek={250}
              />
            </TabsContent>

            <TabsContent value="achievements" className="m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Earned ({userAchievements.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {userAchievements.map((ua) => (
                      <AchievementCard
                        key={ua.id}
                        icon={ua.achievements?.icon || '🏆'}
                        name={ua.achievements?.name || 'Achievement'}
                        description={ua.achievements?.description || ''}
                        isEarned={true}
                        color={ua.achievements?.badge_color}
                        points={ua.achievements?.points}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Locked ({achievements.length - userAchievements.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {achievements
                      .filter(a => !earnedAchievementIds.has(a.id))
                      .map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          icon={achievement.icon || '🏆'}
                          name={achievement.name}
                          description={achievement.description || ''}
                          isEarned={false}
                          color={achievement.badge_color}
                          points={achievement.points}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="m-0">
              <div className="space-y-6">
                <LeaderboardPodium 
                  topThree={leaderboard.slice(0, 3)}
                  currentUserId={session?.user?.id}
                />
                
                {/* Full leaderboard list */}
                <div className="bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.user_id === session?.user?.id;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          flex items-center gap-4 p-4 border-b border-white/5 last:border-0
                          ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-white/5'}
                        `}
                      >
                        <span className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${entry.rank <= 3 
                            ? entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400'
                              : entry.rank === 2 ? 'bg-slate-400/20 text-slate-300'
                              : 'bg-amber-600/20 text-amber-500'
                            : 'bg-white/10 text-foreground/60'}
                        `}>
                          {entry.rank}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                            {entry.display_name}
                            {isCurrentUser && <span className="text-xs ml-2 text-primary/60">(You)</span>}
                          </p>
                        </div>
                        <span className="font-semibold text-foreground">
                          {entry.score.toLocaleString()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="m-0">
              <ChallengesGrid />
            </TabsContent>

            <TabsContent value="streaks" className="m-0">
              <div className="max-w-md mx-auto">
                <StreakDisplay 
                  currentStreak={userStreak} 
                  longestStreak={longestStreak}
                />
              </div>
            </TabsContent>

            <TabsContent value="insights" className="m-0">
              <WeeklyRecap />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
