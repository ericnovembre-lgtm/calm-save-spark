import { motion } from 'framer-motion';
import { Flame, Trophy, Star, TrendingUp } from 'lucide-react';
import { RankBadge } from './RankBadge';

interface GamificationHeroProps {
  totalPoints: number;
  currentStreak: number;
  rank: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  achievementCount: number;
  nextRankPoints?: number;
}

export function GamificationHero({
  totalPoints,
  currentStreak,
  rank,
  tier,
  achievementCount,
  nextRankPoints,
}: GamificationHeroProps) {
  const progress = nextRankPoints ? Math.min((totalPoints / nextRankPoints) * 100, 100) : 100;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-700/50 p-6 md:p-8">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Rank Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <RankBadge tier={tier} rank={rank} size="lg" />
        </motion.div>

        {/* Stats */}
        <div className="flex-1 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-foreground mb-2"
          >
            {rank}
          </motion.h1>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center md:justify-start gap-2 mb-4"
          >
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold text-foreground">{totalPoints.toLocaleString()}</span>
            <span className="text-stone-400">points</span>
          </motion.div>

          {/* Progress to next rank */}
          {nextRankPoints && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="flex justify-between text-sm text-stone-400 mb-1">
                <span>Progress to next rank</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-stone-700/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {(nextRankPoints - totalPoints).toLocaleString()} points to go
              </p>
            </motion.div>
          )}

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center md:justify-start gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{currentStreak}</p>
                <p className="text-xs text-stone-400">day streak</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{achievementCount}</p>
                <p className="text-xs text-stone-400">achievements</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Top 10%</p>
                <p className="text-xs text-stone-400">of savers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
