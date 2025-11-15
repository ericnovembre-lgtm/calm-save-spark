import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Clock } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Activity {
  id: string;
  user: string;
  amount: number;
  location: string;
  timeAgo: string;
  avatar: string;
}

const SAMPLE_NAMES = [
  'Sarah M.', 'John D.', 'Emma W.', 'Michael R.', 'Lisa K.',
  'David P.', 'Amy L.', 'Chris T.', 'Jessica H.', 'Ryan B.'
];

const SAMPLE_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin',
  'London', 'Tokyo', 'Paris', 'Sydney', 'Toronto'
];

/**
 * Live Activity Feed Widget
 * Shows real-time mock savings notifications with smooth animations
 */
export const LiveActivityFeed = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activities, setActivities] = useState<Activity[]>([]);
  const intervalRef = useRef<number>();

  const generateActivity = (): Activity => {
    const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const city = SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)];
    const amount = Math.floor(Math.random() * 200) + 10;
    const initials = name.split(' ').map(n => n[0]).join('');
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      user: name,
      amount,
      location: city,
      timeAgo: 'Just now',
      avatar: initials
    };
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Add initial activities
    setActivities([
      generateActivity(),
      generateActivity(),
      generateActivity()
    ]);

    // Generate new activity every 4-6 seconds
    intervalRef.current = window.setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev];
        return updated.slice(0, 5); // Keep max 5 activities
      });
    }, Math.random() * 2000 + 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Update time ago every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActivities(prev => prev.map((a, i) => ({
        ...a,
        timeAgo: i === 0 ? 'Just now' : `${(i + 1) * 5}s ago`
      })));
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="p-4 rounded-xl bg-card/50 border border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          Live activity feed (animation disabled)
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-accent animate-pulse" />
        <h4 className="font-semibold text-sm text-foreground">
          Live Savings Activity
        </h4>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ 
                opacity: 1 - (index * 0.15), 
                x: 0, 
                scale: 1 - (index * 0.05),
                y: index * -2
              }}
              exit={{ 
                opacity: 0, 
                x: -100, 
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
              style={{
                zIndex: 100 - index
              }}
            >
              <Avatar className="w-10 h-10 border-2 border-accent/30">
                <AvatarFallback className="bg-accent/20 text-foreground text-xs font-semibold">
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {activity.user}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    saved
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {activity.location}
                  </span>
                  <Clock className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {activity.timeAgo}
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="shrink-0"
              >
                <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30">
                  <span className="font-bold text-sm text-accent">
                    ${activity.amount}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
};
