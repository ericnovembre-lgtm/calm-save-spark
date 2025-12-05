import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Trophy, Sparkles } from 'lucide-react';
import { FinancialStory } from '@/hooks/useFinancialStories';

interface StoryMilestoneProps {
  story: FinancialStory;
}

export function StoryMilestone({ story }: StoryMilestoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Create sparkle particles
  useEffect(() => {
    if (!containerRef.current) return;

    const createSparkle = () => {
      const sparkle = document.createElement('div');
      sparkle.className = 'absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.animationDuration = `${0.5 + Math.random() * 1}s`;
      containerRef.current?.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 2000);
    };

    const interval = setInterval(createSparkle, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center text-center max-w-sm">
      {/* Golden glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Trophy with sparkle */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Trophy className="w-12 h-12 text-yellow-900" />
        </div>
        {/* Sparkles around trophy */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-2"
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Milestone badge */}
      <motion.div
        className="px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-yellow-400 font-bold text-sm">MILESTONE REACHED</span>
      </motion.div>

      {/* Amount display */}
      <motion.div
        className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 my-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {story.data.metric || (
          <>$<CountUp end={story.data.amount || 0} duration={2} separator="," /></>
        )}
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="text-2xl font-bold text-white mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {story.headline}
      </motion.h2>

      {/* Body text */}
      <motion.p
        className="text-white/80 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {story.body}
      </motion.p>

      {/* Achievement unlock effect */}
      <motion.div
        className="mt-6 flex items-center gap-2 text-yellow-400/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="text-2xl">✨</span>
        <span className="text-sm font-medium">Achievement Unlocked</span>
        <span className="text-2xl">✨</span>
      </motion.div>
    </div>
  );
}
