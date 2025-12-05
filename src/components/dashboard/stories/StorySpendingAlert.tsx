import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { PieChart, AlertCircle } from 'lucide-react';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface StorySpendingAlertProps {
  story: FinancialStory;
}

export function StorySpendingAlert({ story }: StorySpendingAlertProps) {
  const utilization = story.data.percentChange || 0;

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Circular progress indicator */}
      <motion.div
        className="relative w-32 h-32 mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke={utilization >= 95 ? 'hsl(0, 84%, 60%)' : 'hsl(38, 92%, 50%)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={351.86}
            initial={{ strokeDashoffset: 351.86 }}
            animate={{ strokeDashoffset: 351.86 * (1 - utilization / 100) }}
            transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-amber-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <CountUp end={utilization} duration={1.5} />%
          </motion.span>
          <span className="text-white/60 text-xs">used</span>
        </div>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400/50"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Alert badge */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span className="text-amber-400 font-medium text-sm">Budget Alert</span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="text-2xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {story.headline}
      </motion.h2>

      {/* Amount spent */}
      {story.data.amount !== undefined && (
        <motion.div
          className="text-4xl font-bold text-amber-400 my-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          $<CountUp end={story.data.amount} duration={1} decimals={0} />
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

      {/* Tip */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-white/60 text-sm">
          💡 Consider moving funds from another category or adjusting your spending for the rest of the month.
        </p>
      </motion.div>
    </div>
  );
}
