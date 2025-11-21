import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function AIPersonalizedHero() {
  const prefersReducedMotion = useReducedMotion();
  const [timeGreeting, setTimeGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      const timeStr = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setCurrentTime(timeStr);
      
      if (hour < 12) setTimeGreeting('Good morning');
      else if (hour < 18) setTimeGreeting('Good afternoon');
      else setTimeGreeting('Good evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: TrendingUp, label: 'Market Active', value: '+2.4%', color: 'text-green-500' },
    { icon: Clock, label: 'Your Time', value: currentTime, color: 'text-primary' },
    { icon: Users, label: 'Active Now', value: '1.2K', color: 'text-accent' }
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8 space-y-4"
    >
      {/* Personalized greeting */}
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        animate={prefersReducedMotion ? {} : {
          boxShadow: [
            '0 0 0 0 hsl(var(--primary) / 0.3)',
            '0 0 0 8px hsl(var(--primary) / 0)',
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <span className="text-sm font-medium text-foreground">
          {timeGreeting}! Ready to grow your wealth?
        </span>
      </motion.div>

      {/* Live stats ticker */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className={`text-sm font-semibold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
