import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Star, Users, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: Users, text: '1M+ users saving smarter' },
  { icon: TrendingUp, text: '$500M+ saved collectively' },
  { icon: Star, text: '4.9★ rated by users' },
  { icon: Award, text: 'Best Fintech App 2024' },
];

export default function ScrollingTicker() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="flex gap-8 justify-center py-4 bg-primary/5 border-y border-primary/10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-primary" />
              <span className="font-medium">{stat.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Duplicate for seamless loop
  const duplicatedStats = [...stats, ...stats];

  return (
    <div className="relative overflow-hidden py-4 bg-primary/5 border-y border-primary/10">
      <motion.div
        className="flex gap-12"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="font-medium">{stat.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
