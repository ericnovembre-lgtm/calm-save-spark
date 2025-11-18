import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

type LeaderboardType = 'savings' | 'streak' | 'budget_adherence';
type Period = 'weekly' | 'monthly' | 'all_time';

export function Leaderboard() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('savings');
  const [period, setPeriod] = useState<Period>('weekly');

  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard', leaderboardType, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('leaderboard_type', leaderboardType)
        .eq('period', period)
        .eq('is_visible', true)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const userEntry = entries.find(e => e.user_id === user?.id);
  const userRank = userEntry?.rank;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  const getTypeLabel = () => {
    switch (leaderboardType) {
      case 'savings': return 'Total Saved';
      case 'streak': return 'Longest Streak';
      case 'budget_adherence': return 'Budget Score';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">Leaderboard</h3>
      </div>

      {/* Type Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={leaderboardType === 'savings' ? 'default' : 'outline'}
          onClick={() => setLeaderboardType('savings')}
        >
          💰 Savings
        </Button>
        <Button
          size="sm"
          variant={leaderboardType === 'streak' ? 'default' : 'outline'}
          onClick={() => setLeaderboardType('streak')}
        >
          🔥 Streak
        </Button>
        <Button
          size="sm"
          variant={leaderboardType === 'budget_adherence' ? 'default' : 'outline'}
          onClick={() => setLeaderboardType('budget_adherence')}
        >
          📊 Budget
        </Button>
      </div>

      {/* Period Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={period === 'weekly' ? 'default' : 'outline'}
          onClick={() => setPeriod('weekly')}
        >
          This Week
        </Button>
        <Button
          size="sm"
          variant={period === 'monthly' ? 'default' : 'outline'}
          onClick={() => setPeriod('monthly')}
        >
          This Month
        </Button>
        <Button
          size="sm"
          variant={period === 'all_time' ? 'default' : 'outline'}
          onClick={() => setPeriod('all_time')}
        >
          All Time
        </Button>
      </div>

      {/* Your Rank */}
      {userRank && (
        <div className="p-3 mb-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRankIcon(userRank)}
              <span className="font-medium">Your Rank</span>
            </div>
            <Badge variant="outline">{getTypeLabel()}: {userEntry?.score}</Badge>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${
                entry.user_id === user?.id
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-muted/30 border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank || index + 1)}
                  <div>
                    <p className="font-medium">
                      {entry.display_name || 'Anonymous User'}
                    </p>
                    {entry.user_id === user?.id && (
                      <Badge variant="outline" className="text-xs mt-1">You</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{entry.score}</p>
                  <p className="text-xs text-muted-foreground">{getTypeLabel()}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {entries.length === 0 && (
            <Card className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No entries yet for this period</p>
              <p className="text-xs text-muted-foreground mt-2">
                Be the first to appear on the leaderboard!
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Your privacy is protected. Only you can see your real name.
        </p>
      </div>
    </Card>
  );
}
