import { motion } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
  change: number;
  isCurrentUser?: boolean;
}

export function CompetitiveLeaderboards() {
  const [activeBoard, setActiveBoard] = useState<'savings' | 'streak' | 'goals'>('savings');

  const savingsLeaders: LeaderboardEntry[] = [
    { rank: 1, username: 'SaverPro', value: 15240, change: 2 },
    { rank: 2, username: 'MoneyMaven', value: 14850, change: -1 },
    { rank: 3, username: 'GoalGetter', value: 13920, change: 1 },
    { rank: 4, username: 'You', value: 12500, change: 3, isCurrentUser: true },
    { rank: 5, username: 'BudgetBoss', value: 11800, change: -2 }
  ];

  const streakLeaders: LeaderboardEntry[] = [
    { rank: 1, username: 'ConsistentCarl', value: 156, change: 0 },
    { rank: 2, username: 'DailyDoer', value: 142, change: 1 },
    { rank: 3, username: 'You', value: 89, change: 2, isCurrentUser: true },
    { rank: 4, username: 'SteadySteve', value: 87, change: -1 },
    { rank: 5, username: 'RegularRita', value: 75, change: 0 }
  ];

  const goalsLeaders: LeaderboardEntry[] = [
    { rank: 1, username: 'GoalMaster', value: 24, change: 1 },
    { rank: 2, username: 'Achiever', value: 21, change: 0 },
    { rank: 3, username: 'You', value: 18, change: 4, isCurrentUser: true },
    { rank: 4, username: 'Planner', value: 16, change: -2 },
    { rank: 5, username: 'Dreamer', value: 15, change: 1 }
  ];

  const leaderboards = {
    savings: savingsLeaders,
    streak: streakLeaders,
    goals: goalsLeaders
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Leaderboards</h3>
          <p className="text-sm text-muted-foreground">Compete with the community</p>
        </div>
      </div>

      <Tabs value={activeBoard} onValueChange={(v) => setActiveBoard(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {(['savings', 'streak', 'goals'] as const).map((board) => (
          <TabsContent key={board} value={board} className="mt-6">
            <div className="space-y-3">
              {leaderboards[board].map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    entry.isCurrentUser 
                      ? 'bg-primary/10 border-2 border-primary/30' 
                      : 'bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(entry.rank) || (
                      <span className="text-lg font-bold text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar & Username */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {board === 'savings' && `$${entry.value.toLocaleString()}`}
                      {board === 'streak' && `${entry.value} days`}
                      {board === 'goals' && `${entry.value} completed`}
                    </div>
                  </div>

                  {/* Rank Change */}
                  <div className={`flex items-center gap-1 text-sm ${
                    entry.change > 0 ? 'text-green-500' :
                    entry.change < 0 ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {entry.change !== 0 && (
                      <TrendingUp 
                        className={`w-4 h-4 ${entry.change < 0 ? 'rotate-180' : ''}`}
                      />
                    )}
                    {entry.change !== 0 && Math.abs(entry.change)}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              Weekly reset in 4 days
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
