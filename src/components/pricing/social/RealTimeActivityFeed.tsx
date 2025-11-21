import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PRICING_TIERS } from '@/components/pricing/TierBadge';

interface Activity {
  id: string;
  name: string;
  action: string;
  tier: string;
  location: string;
  timestamp: Date;
}

const NAMES = ['Sarah', 'Michael', 'Emily', 'James', 'Jessica', 'David', 'Ashley', 'Chris'];
const LOCATIONS = ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Boston', 'Seattle', 'Miami'];
const ACTIONS = ['upgraded to', 'joined', 'renewed'];

export function RealTimeActivityFeed() {
  const prefersReducedMotion = useReducedMotion();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const generateActivity = (): Activity => {
      const tier = PRICING_TIERS[Math.floor(Math.random() * PRICING_TIERS.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        tier: tier.name,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        timestamp: new Date(),
      };
    };

    const interval = setInterval(() => {
      if (!isPaused) {
        setActivities(prev => {
          const newActivity = generateActivity();
          return [newActivity, ...prev].slice(0, 5);
        });
      }
    }, 3000);

    // Initial activities
    setActivities([generateActivity(), generateActivity()]);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      className="fixed bottom-6 left-6 z-40 max-w-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
            <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>

        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -20, height: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, height: 'auto' }}
                exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                className="p-3 bg-accent/5 hover:bg-accent/10 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {activity.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{activity.name}</span> {activity.action}{' '}
                      <span className="text-primary font-semibold">{activity.tier}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{activity.location}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - activity.timestamp.getTime()) / 1000)}s ago
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
