import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  score: number;
  badge?: string;
}

interface LeaderboardRankProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}

/**
 * Animated leaderboard with rank changes and spotlight
 */
export const LeaderboardRank = ({ 
  entries, 
  currentUserId,
  className = '' 
}: LeaderboardRankProps) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return 'up';
    if (current > previous) return 'down';
    return 'same';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.map((entry, index) => {
        const isCurrentUser = entry.id === currentUserId;
        const rankChange = getRankChange(entry.rank, entry.previousRank);
        
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative overflow-hidden ${
                isCurrentUser ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              {/* Spotlight effect for current user */}
              {isCurrentUser && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                />
              )}

              <div className="relative flex items-center gap-4 p-4">
                {/* Rank */}
                <div className="flex flex-col items-center min-w-[40px]">
                  <motion.span
                    className={`text-2xl font-bold ${getRankColor(entry.rank)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  >
                    {entry.rank <= 3 ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      entry.rank
                    )}
                  </motion.span>

                  {/* Rank change indicator */}
                  {rankChange !== 'same' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs ${
                        rankChange === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {rankChange === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback>
                    {entry.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    {entry.badge && (
                      <span className="text-lg">{entry.badge}</span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <motion.div
                  className="text-right"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <p className="text-lg font-bold text-primary">
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </motion.div>
              </div>

              {/* Animated border for top 3 */}
              {entry.rank <= 3 && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${
                      entry.rank === 1
                        ? 'hsl(var(--chart-1))'
                        : entry.rank === 2
                        ? 'hsl(var(--muted))'
                        : 'hsl(var(--chart-2))'
                    }, transparent)`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                />
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
