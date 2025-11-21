import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function LiveSavingsCounter() {
  const prefersReducedMotion = useReducedMotion();
  const [totalSavings, setTotalSavings] = useState(47832945);
  const [activeUsers, setActiveUsers] = useState(12847);
  const [recentMilestone, setRecentMilestone] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSavings(prev => {
        const increment = Math.floor(Math.random() * 500) + 100;
        const newTotal = prev + increment;
        
        // Check for milestone
        if (newTotal > 48000000 && prev < 48000000) {
          setRecentMilestone('$48M saved!');
          if (!prefersReducedMotion) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          }
          setTimeout(() => setRecentMilestone(null), 3000);
        }
        
        return newTotal;
      });
      
      setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl p-6 border border-primary/20 overflow-hidden"
    >
      {/* Animated background particles */}
      {!prefersReducedMotion && [...Array(5)].map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          initial={{ y: '100%', x: `${idx * 25}%` }}
          animate={{ y: '-100%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: idx * 0.5,
            ease: 'linear'
          }}
        />
      ))}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Live Community Savings
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <CountUp end={activeUsers} duration={2} separator="," />
          </div>
        </div>

        <div className="text-4xl font-bold text-foreground mb-2">
          $<CountUp
            end={totalSavings}
            duration={2}
            separator=","
            preserveValue
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-primary">
          <TrendingUp className="w-4 h-4" />
          <span>Growing every second</span>
        </div>

        {/* Milestone notification */}
        <AnimatePresence>
          {recentMilestone && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded-lg text-center"
            >
              <p className="text-sm font-semibold text-primary">{recentMilestone}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
