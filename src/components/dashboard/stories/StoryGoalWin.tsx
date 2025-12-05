import { useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Target, PartyPopper } from 'lucide-react';
import { FinancialStory } from '@/hooks/useFinancialStories';
import confetti from 'canvas-confetti';

interface StoryGoalWinProps {
  story: FinancialStory;
}

export function StoryGoalWin({ story }: StoryGoalWinProps) {
  useEffect(() => {
    // Celebration confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Trophy animation */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 8, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Target className="w-12 h-12 text-white" />
        </div>
        {/* Celebration icon */}
        <motion.div
          className="absolute -top-3 -right-3"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <PartyPopper className="w-8 h-8 text-violet-400" />
        </motion.div>
      </motion.div>

      {/* Goal name */}
      {story.data.goalName && (
        <motion.div
          className="text-violet-400 text-sm font-medium mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {story.data.goalName}
        </motion.div>
      )}

      {/* Headline */}
      <motion.h2
        className="text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {story.headline}
      </motion.h2>

      {/* Amount saved */}
      {story.data.amount !== undefined && (
        <motion.div
          className="text-5xl font-bold text-violet-400 my-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          $<CountUp end={story.data.amount} duration={1.5} separator="," />
        </motion.div>
      )}

      {/* Progress indicator for near-complete goals */}
      {story.data.percentChange && story.data.percentChange < 100 && (
        <motion.div
          className="w-full max-w-xs mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${story.data.percentChange}%` }}
              transition={{ delay: 0.8, duration: 1 }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2">
            {story.data.percentChange.toFixed(0)}% complete
          </p>
        </motion.div>
      )}

      {/* Body text */}
      <motion.p
        className="text-white/80 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {story.body}
      </motion.p>

      {/* Celebration badge */}
      <motion.div
        className="mt-6 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-violet-400 font-medium">
          🎉 You crushed it!
        </span>
      </motion.div>
    </div>
  );
}
