import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Dynamic gradient background with time-based transitions
 * Creates ambient depth with parallax layers
 */
export const DynamicBackground = () => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('day');
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const gradients = {
    morning: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.03))',
    day: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.03), hsl(var(--background)))',
    evening: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.05))',
    night: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.1), hsl(var(--muted) / 0.05))'
  };

  return (
    <div className="fixed inset-0 -z-10">
      {/* Layer 1 - Base gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: gradients[timeOfDay]
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {/* Layer 2 - Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)), transparent)'
          }}
          animate={{
            x: ['-10%', '110%'],
            y: ['-10%', '50%', '110%']
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)), transparent)'
          }}
          animate={{
            x: ['110%', '-10%'],
            y: ['110%', '50%', '-10%']
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Layer 3 - Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};
