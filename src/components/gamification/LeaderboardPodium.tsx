import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  rank_change?: number;
}

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
  currentUserId?: string;
}

const podiumConfig = {
  1: {
    height: 'h-32',
    bg: 'bg-gradient-to-t from-yellow-600/30 to-yellow-400/20',
    border: 'border-yellow-500/50',
    icon: <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400/30" />,
    label: '1st',
    glow: 'shadow-yellow-500/30',
  },
  2: {
    height: 'h-24',
    bg: 'bg-gradient-to-t from-slate-500/30 to-slate-400/20',
    border: 'border-slate-400/50',
    icon: <Medal className="w-5 h-5 text-slate-300" />,
    label: '2nd',
    glow: 'shadow-slate-400/20',
  },
  3: {
    height: 'h-20',
    bg: 'bg-gradient-to-t from-amber-700/30 to-amber-600/20',
    border: 'border-amber-600/50',
    icon: <Medal className="w-5 h-5 text-amber-600" />,
    label: '3rd',
    glow: 'shadow-amber-600/20',
  },
};

export function LeaderboardPodium({ topThree, currentUserId }: LeaderboardPodiumProps) {
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Reorder for display: 2nd, 1st, 3rd
  const displayOrder = [
    topThree.find(e => e.rank === 2),
    topThree.find(e => e.rank === 1),
    topThree.find(e => e.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  if (displayOrder.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No leaderboard data yet
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {displayOrder.map((entry, index) => {
        const config = podiumConfig[entry.rank as 1 | 2 | 3];
        const isCurrentUser = entry.user_id === currentUserId;
        const delay = [0.2, 0, 0.3][index];

        return (
          <motion.div
            key={entry.id}
            initial={reduceMotion ? {} : { y: 50, opacity: 0 }}
            animate={reduceMotion ? {} : { y: 0, opacity: 1 }}
            transition={{ delay, type: 'spring', damping: 15 }}
            className="flex flex-col items-center"
          >
            {/* Avatar and name */}
            <motion.div
              initial={reduceMotion ? {} : { scale: 0.8 }}
              animate={reduceMotion ? {} : { scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={`relative mb-3 ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''}`}
            >
              {/* Crown for 1st place */}
              {entry.rank === 1 && (
                <motion.div
                  initial={reduceMotion ? {} : { y: -10, opacity: 0 }}
                  animate={reduceMotion ? {} : { y: 0, opacity: 1 }}
                  transition={{ delay: delay + 0.4 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                >
                  {config.icon}
                </motion.div>
              )}

              <div className={`
                w-16 h-16 rounded-full 
                ${config.bg} ${config.border} border-2
                flex items-center justify-center
                shadow-lg ${config.glow}
              `}>
                {entry.avatar_url ? (
                  <img 
                    src={entry.avatar_url} 
                    alt={entry.display_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-foreground">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Rank change indicator */}
              {entry.rank_change !== undefined && entry.rank_change !== 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.5 }}
                  className={`
                    absolute -right-1 -bottom-1 w-6 h-6 rounded-full 
                    flex items-center justify-center text-xs font-bold
                    ${entry.rank_change > 0 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'}
                  `}
                >
                  {entry.rank_change > 0 ? `↑${entry.rank_change}` : `↓${Math.abs(entry.rank_change)}`}
                </motion.div>
              )}
            </motion.div>

            {/* Name */}
            <p className={`text-sm font-medium mb-2 ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              {entry.display_name}
            </p>

            {/* Score */}
            <p className="text-xs text-muted-foreground mb-2">
              {entry.score.toLocaleString()} pts
            </p>

            {/* Podium */}
            <motion.div
              initial={reduceMotion ? {} : { height: 0 }}
              animate={reduceMotion ? {} : { height: 'auto' }}
              transition={{ delay: delay + 0.1, duration: 0.4 }}
              className={`
                w-20 ${config.height} rounded-t-lg
                ${config.bg} ${config.border} border-2 border-b-0
                flex items-start justify-center pt-2
                shadow-lg ${config.glow}
              `}
            >
              <span className="text-lg font-bold text-foreground/80">
                {config.label}
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
