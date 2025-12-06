import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { useMemo } from 'react';

interface AchievementCardProps {
  icon: string;
  name: string;
  description: string;
  isEarned: boolean;
  color?: string | null;
  points?: number;
}

export function AchievementCard({
  icon,
  name,
  description,
  isEarned,
  color,
  points,
}: AchievementCardProps) {
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
      whileHover={reduceMotion ? {} : { scale: 1.02 }}
      className={`
        relative p-4 rounded-xl border transition-colors
        ${isEarned 
          ? 'bg-background/80 border-white/20 hover:bg-background/90' 
          : 'bg-white/5 border-white/10 opacity-60'}
      `}
    >
      {/* Lock overlay for unearned */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      {/* Icon */}
      <div 
        className={`
          w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
          ${isEarned ? 'bg-primary/20' : 'bg-white/10'}
        `}
        style={isEarned && color ? { backgroundColor: `${color}30` } : undefined}
      >
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Name */}
      <h4 className="text-sm font-medium text-foreground text-center mb-1 line-clamp-2">
        {name}
      </h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-2">
        {description}
      </p>

      {/* Points */}
      {points && points > 0 && (
        <div className="flex items-center justify-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-yellow-400">{points}</span>
        </div>
      )}

      {/* Glow effect for earned */}
      {isEarned && !reduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${color || 'hsl(var(--primary)'}30`,
          }}
        />
      )}
    </motion.div>
  );
}
