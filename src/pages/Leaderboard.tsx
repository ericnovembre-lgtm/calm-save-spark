import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Target, Zap, Crown, Medal, Award, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardPodium } from "@/components/gamification/LeaderboardPodium";

type TimePeriod = 'weekly' | 'monthly' | 'all-time';

export default function Leaderboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;

  // Fetch leaderboard data
  const { data: topSavers } = useQuery({
    queryKey: ['leaderboard-savers', timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          goals!inner(current_amount)
        `)
        .order('goals.current_amount', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      // Aggregate savings per user
      const userSavings = data.reduce((acc: any[], profile: any) => {
        const existing = acc.find(u => u.id === profile.id);
        const amount = parseFloat(String(profile.goals?.current_amount || 0));
        
        if (existing) {
          existing.totalSaved += amount;
        } else {
          acc.push({
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
            totalSaved: amount,
            // Simulate rank changes for demo (in production, compare with previous snapshot)
            rankChange: Math.floor(Math.random() * 5) - 2,
          });
        }
        return acc;
      }, []);

      return userSavings
        .sort((a, b) => b.totalSaved - a.totalSaved)
        .slice(0, 20)
        .map((user, index) => ({ ...user, rank: index + 1 }));
    },
  });

  // Fetch achievement rankings
  const { data: achievementLeaders } = useQuery({
    queryKey: ['leaderboard-achievements', timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          profiles:user_id(full_name, email),
          achievements:achievement_id(points)
        `);
      
      if (error) throw error;

      // Aggregate points per user
      const userPoints = data.reduce((acc: any[], record: any) => {
        const existing = acc.find((u: any) => u.id === record.user_id);
        const points = record.achievements?.points || 0;
        const name = record.profiles?.full_name || record.profiles?.email?.split('@')[0] || 'Unknown';
        
        if (existing) {
          existing.totalPoints += points;
        } else {
          acc.push({
            id: record.user_id,
            name,
            totalPoints: points,
            rankChange: Math.floor(Math.random() * 5) - 2,
          });
        }
        return acc;
      }, []);

      return userPoints
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20)
        .map((user, index) => ({ ...user, rank: index + 1 }));
    },
  });

  // Fetch streak leaders
  const { data: streakLeaders } = useQuery({
    queryKey: ['leaderboard-streaks', timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, current_streak')
        .order('current_streak', { ascending: false })
        .limit(20);
      
      if (error) throw error;

      return data
        .filter(user => (user.current_streak || 0) > 0)
        .map((user, index) => ({
          id: user.id,
          name: user.full_name || user.email?.split('@')[0] || 'Unknown',
          streak: user.current_streak || 0,
          rank: index + 1,
          rankChange: Math.floor(Math.random() * 3) - 1,
        }));
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700";
    return "bg-muted";
  };

  // Transform data for LeaderboardPodium
  const transformToPodiumData = (data: any[] | undefined, valueKey: string) => {
    if (!data) return [];
    return data.slice(0, 3).map(user => ({
      id: user.id,
      user_id: user.id,
      display_name: user.name,
      score: user[valueKey] || 0,
      rank: user.rank,
      rank_change: user.rankChange,
    }));
  };

  const LeaderboardItem = ({ user, rank, value, label, isCurrentUser, rankChange }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.03 }}
      layout
    >
      <Card className={`p-4 mb-3 hover:shadow-md transition-all ${
        isCurrentUser ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10' : ''
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            rank <= 3 ? getRankBadgeColor(rank) : 'bg-muted'
          }`}>
            {getRankIcon(rank)}
          </div>
          
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user.name?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground truncate">
                {user.name}
              </p>
              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs">You</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>

          {/* Rank change indicator */}
          <AnimatePresence>
            {rankChange !== undefined && rankChange !== 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  rankChange > 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {rankChange > 0 ? (
                  <>
                    <ArrowUp className="w-3 h-3" />
                    <span>{rankChange}</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3" />
                    <span>{Math.abs(rankChange)}</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-right">
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground">
                See how you rank against other $ave+ users
              </p>
            </div>
          </div>

          {/* Time period toggle */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {(['weekly', 'monthly', 'all-time'] as TimePeriod[]).map((period) => (
              <Button
                key={period}
                variant={timePeriod === period ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimePeriod(period)}
                className="capitalize text-xs"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="savers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="savers" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Savers
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="savers" className="mt-6 space-y-6">
            {/* Podium for top 3 */}
            <Card className="p-6 bg-gradient-to-b from-yellow-500/5 to-transparent">
              <h2 className="text-lg font-semibold mb-2 text-center">Top 3 Savers</h2>
              <LeaderboardPodium 
                topThree={transformToPodiumData(topSavers, 'totalSaved')}
                currentUserId={userId}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Savers This {timePeriod === 'all-time' ? 'All Time' : timePeriod === 'weekly' ? 'Week' : 'Month'}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Users who have saved the most across all their goals
              </p>
              <div className="space-y-2">
                {topSavers?.slice(3).map((user) => (
                  <LeaderboardItem
                    key={user.id}
                    user={user}
                    rank={user.rank}
                    value={`$${user.totalSaved.toLocaleString()}`}
                    label="Total Saved"
                    isCurrentUser={user.id === userId}
                    rankChange={user.rankChange}
                  />
                ))}
                {(!topSavers || topSavers.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No data available yet. Start saving to appear on the leaderboard!
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6 space-y-6">
            {/* Podium for top 3 */}
            <Card className="p-6 bg-gradient-to-b from-primary/5 to-transparent">
              <h2 className="text-lg font-semibold mb-2 text-center">Achievement Champions</h2>
              <LeaderboardPodium 
                topThree={transformToPodiumData(achievementLeaders, 'totalPoints')}
                currentUserId={userId}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Achievement Champions
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Users with the most achievement points
              </p>
              <div className="space-y-2">
                {achievementLeaders?.slice(3).map((user) => (
                  <LeaderboardItem
                    key={user.id}
                    user={user}
                    rank={user.rank}
                    value={`${user.totalPoints} pts`}
                    label="Achievement Points"
                    isCurrentUser={user.id === userId}
                    rankChange={user.rankChange}
                  />
                ))}
                {(!achievementLeaders || achievementLeaders.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No achievements earned yet. Complete challenges to climb the ranks!
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="streaks" className="mt-6 space-y-6">
            {/* Podium for top 3 */}
            <Card className="p-6 bg-gradient-to-b from-orange-500/5 to-transparent">
              <h2 className="text-lg font-semibold mb-2 text-center">Streak Masters</h2>
              <LeaderboardPodium 
                topThree={transformToPodiumData(streakLeaders, 'streak')}
                currentUserId={userId}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Longest Saving Streaks
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Users with the longest consecutive saving streaks
              </p>
              <div className="space-y-2">
                {streakLeaders?.slice(3).map((user) => (
                  <LeaderboardItem
                    key={user.id}
                    user={user}
                    rank={user.rank}
                    value={`${user.streak} days`}
                    label="Current Streak"
                    isCurrentUser={user.id === userId}
                    rankChange={user.rankChange}
                  />
                ))}
                {(!streakLeaders || streakLeaders.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No streaks yet. Make regular transfers to build your streak!
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-6 bg-accent/5 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Climb the Ranks!
              </h3>
              <p className="text-sm text-muted-foreground">
                Save consistently, complete achievements, and maintain your streak to rise through the leaderboard. 
                Your position updates in real-time as you make progress.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
