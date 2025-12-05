import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FinancialStory } from '@/hooks/useFinancialStories';
import confetti from 'canvas-confetti';

interface StoryHighFiveProps {
  story: FinancialStory;
}

export function StoryHighFive({ story }: StoryHighFiveProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after a brief delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Emoji with bounce */}
      <motion.div
        className="text-7xl mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      >
        🙌
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {story.headline}
      </motion.h2>

      {/* Amount display */}
      {story.data.amount !== undefined && (
        <motion.div
          className="text-5xl font-bold text-emerald-400 my-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          $<CountUp end={story.data.amount} duration={1.5} decimals={0} />
        </motion.div>
      )}

      {/* Body text */}
      <motion.p
        className="text-white/80 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {story.body}
      </motion.p>

      {/* Savings comparison */}
      {story.data.comparison && (
        <motion.div
          className="mt-6 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-emerald-400 font-medium">
            {story.data.comparison}
          </span>
        </motion.div>
      )}

      {/* Percentage badge */}
      {story.data.percentChange !== undefined && (
        <motion.div
          className="mt-4 flex items-center gap-2 text-emerald-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-2xl font-bold">
            {Math.abs(story.data.percentChange)}%
          </span>
          <span className="text-white/60">below average</span>
        </motion.div>
      )}
    </div>
  );
}
