import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface RankBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rank: string;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

const tierConfig = {
  bronze: {
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    glow: 'shadow-amber-500/30',
    icon: '🥉',
    ring: 'ring-amber-600/50',
  },
  silver: {
    gradient: 'from-slate-400 via-slate-300 to-slate-500',
    glow: 'shadow-slate-400/30',
    icon: '🥈',
    ring: 'ring-slate-400/50',
  },
  gold: {
    gradient: 'from-yellow-500 via-amber-400 to-yellow-600',
    glow: 'shadow-yellow-500/40',
    icon: '🥇',
    ring: 'ring-yellow-500/50',
  },
  platinum: {
    gradient: 'from-slate-300 via-white to-slate-400',
    glow: 'shadow-white/30',
    icon: '🏆',
    ring: 'ring-white/50',
  },
  diamond: {
    gradient: 'from-cyan-400 via-blue-300 to-violet-400',
    glow: 'shadow-cyan-400/40',
    icon: '💎',
    ring: 'ring-cyan-400/50',
  },
};

const sizeConfig = {
  sm: { container: 'w-12 h-12', icon: 'text-xl', ring: 'ring-2' },
  md: { container: 'w-20 h-20', icon: 'text-3xl', ring: 'ring-3' },
  lg: { container: 'w-28 h-28', icon: 'text-5xl', ring: 'ring-4' },
};

export function RankBadge({ tier, rank, size = 'md', showGlow = true }: RankBadgeProps) {
  const config = tierConfig[tier];
  const sizeStyles = sizeConfig[size];

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <motion.div
      initial={reduceMotion ? {} : { scale: 0.8, opacity: 0 }}
      animate={reduceMotion ? {} : { scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Glow effect */}
      {showGlow && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-60 bg-gradient-to-br ${config.gradient}`}
        />
      )}

      {/* Badge */}
      <div
        className={`
          relative ${sizeStyles.container} rounded-full 
          bg-gradient-to-br ${config.gradient}
          ${sizeStyles.ring} ${config.ring}
          flex items-center justify-center
          shadow-xl ${showGlow ? config.glow : ''}
        `}
      >
        {/* Inner ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Icon */}
        <span className={sizeStyles.icon}>{config.icon}</span>

        {/* Shimmer effect for legendary tiers */}
        {(tier === 'diamond' || tier === 'platinum') && !reduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
