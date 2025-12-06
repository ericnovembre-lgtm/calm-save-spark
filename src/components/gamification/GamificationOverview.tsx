import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentUnlock {
  id: string;
  name: string;
  icon: string;
  earned_at: string;
  points: number;
}

interface ActiveChallenge {
  id: string;
  title: string;
  progress: number;
  target: number;
  ends_at: string;
}

interface GamificationOverviewProps {
  recentUnlocks: RecentUnlock[];
  activeChallenges: ActiveChallenge[];
  weeklyInsightsSummary?: string;
  totalSavedThisWeek: number;
}

export function GamificationOverview({
  recentUnlocks,
  activeChallenges,
  weeklyInsightsSummary,
  totalSavedThisWeek,
}: GamificationOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-background/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Recent Unlocks
            </CardTitle>
            <Link 
              to="/achievements" 
              className="text-sm text-primary hover:underline flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentUnlocks.length > 0 ? (
              <div className="space-y-3">
                {recentUnlocks.slice(0, 3).map((unlock, index) => (
                  <motion.div
                    key={unlock.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-2xl">{unlock.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{unlock.name}</p>
                      <p className="text-xs text-muted-foreground">
                        +{unlock.points} points
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No achievements unlocked yet. Keep saving!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-background/50 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Active Challenges
            </CardTitle>
            <Link 
              to="/community" 
              className="text-sm text-primary hover:underline flex items-center"
            >
              Browse
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {activeChallenges.length > 0 ? (
              <div className="space-y-3">
                {activeChallenges.slice(0, 3).map((challenge, index) => {
                  const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-2 rounded-lg bg-white/5"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-foreground text-sm truncate">
                          {challenge.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No active challenges. Join one to compete!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-background/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Total Saved</span>
              <span className="text-xl font-bold text-emerald-400">
                ${totalSavedThisWeek.toLocaleString()}
              </span>
            </div>
            {weeklyInsightsSummary && (
              <p className="text-sm text-foreground/80 bg-white/5 p-3 rounded-lg">
                {weeklyInsightsSummary}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/10 backdrop-blur-sm border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Keep Your Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 mb-3">
              Save or log a transaction today to maintain your streak!
            </p>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors text-sm font-medium"
            >
              Add Transaction
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
