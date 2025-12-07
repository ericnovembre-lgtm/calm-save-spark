import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Flame, Zap } from 'lucide-react';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface StoryStreakProps {
  story: FinancialStory;
}

export function StoryStreak({ story }: StoryStreakProps) {
  // Extract streak number from metric
  const streakDays = parseInt(story.data.metric?.replace(/\D/g, '') || '0');

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Fire animation */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <Flame className="w-12 h-12 text-white" />
          </motion.div>
        </div>
        
        {/* Energy sparks */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${20 + i * 20}%`,
              left: i % 2 === 0 ? '-10%' : '90%'
            }}
            animate={{
              y: [-5, 5, -5],
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity
            }}
          >
            <Zap className="w-5 h-5 text-amber-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Streak counter */}
      <motion.div
        className="flex items-baseline gap-2 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
          <CountUp end={streakDays} duration={1.5} />
        </span>
        <span className="text-2xl text-white/60">days</span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {story.headline}
      </motion.h2>

      {/* Body text */}
      <motion.p
        className="text-white/80 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {story.body}
      </motion.p>

      {/* Streak milestones */}
      <motion.div
        className="mt-6 flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {[7, 14, 30].map((milestone) => (
          <div
            key={milestone}
            className={`flex flex-col items-center p-2 rounded-lg ${
              streakDays >= milestone 
                ? 'bg-amber-500/20 border border-amber-500/30' 
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <span className={`text-sm font-bold ${
              streakDays >= milestone ? 'text-amber-400' : 'text-white/40'
            }`}>
              {milestone}
            </span>
            <span className={`text-xs ${
              streakDays >= milestone ? 'text-amber-400/70' : 'text-white/30'
            }`}>
              days
            </span>
            {streakDays >= milestone && (
              <span className="text-xs mt-1">✓</span>
            )}
          </div>
        ))}
      </motion.div>

      {/* Motivation */}
      <motion.div
        className="mt-6 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-amber-400 font-medium">
          {streakDays >= 30 ? '🏆 Legendary!' : 
           streakDays >= 14 ? '⚡ Unstoppable!' : 
           streakDays >= 7 ? '🔥 On fire!' : '💪 Keep going!'}
        </span>
      </motion.div>
    </div>
  );
}
