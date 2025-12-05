import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface StoryNudgeProps {
  story: FinancialStory;
}

const shakeAnimation = {
  x: [0, -10, 10, -10, 10, -5, 5, 0],
  transition: { duration: 0.6, delay: 0.3 }
};

export function StoryNudge({ story }: StoryNudgeProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Warning icon with shake */}
      <motion.div
        className="relative mb-6"
        animate={shakeAnimation}
      >
        <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-rose-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Merchant name */}
      {story.data.merchantName && (
        <motion.div
          className="text-rose-400 text-sm font-medium mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {story.data.merchantName}
        </motion.div>
      )}

      {/* Headline with shake */}
      <motion.h2
        className="text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {story.headline}
      </motion.h2>

      {/* Price increase display */}
      <motion.div
        className="flex items-center gap-3 my-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="text-4xl font-bold text-white">
          $<CountUp end={story.data.amount || 0} duration={1} decimals={2} />
        </div>
        {story.data.percentChange && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 text-rose-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold">+{story.data.percentChange.toFixed(0)}%</span>
          </div>
        )}
      </motion.div>

      {/* Body text */}
      <motion.p
        className="text-white/80 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {story.body}
      </motion.p>

      {/* Action suggestion */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-white/60 text-sm">
          💡 Tip: Review your subscriptions regularly to catch price increases early.
        </p>
      </motion.div>
    </div>
  );
}
