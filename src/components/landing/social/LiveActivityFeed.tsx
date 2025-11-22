import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, DollarSign, Zap } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Activity {
  id: string;
  user: string;
  location: string;
  action: string;
  amount?: string;
  icon: any;
  timestamp: Date;
}

const cities = ['NYC', 'SF', 'LA', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver', 'Miami', 'Portland'];
const actions = [
  { text: 'just saved', icon: DollarSign, hasAmount: true },
  { text: 'reached their goal', icon: Target, hasAmount: true },
  { text: 'automated their savings', icon: Zap, hasAmount: false },
  { text: 'hit a milestone', icon: TrendingUp, hasAmount: true },
  { text: 'started their journey', icon: DollarSign, hasAmount: false },
];

const generateActivity = (): Activity => {
  const action = actions[Math.floor(Math.random() * actions.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const amount = action.hasAmount 
    ? `$${(Math.floor(Math.random() * 20) + 1) * 250}` 
    : undefined;

  return {
    id: `${Date.now()}-${Math.random()}`,
    user: 'Someone',
    location: city,
    action: action.text,
    amount,
    icon: action.icon,
    timestamp: new Date(),
  };
};

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Add initial activity
    setActivities([generateActivity()]);

    // Add new activity every 4 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities((prev) => [newActivity, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className="text-sm font-medium">Live Activity</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            Join the Movement
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real people reaching their financial goals every day
          </p>
        </motion.div>

        {/* Activity Feed */}
        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ 
                    opacity: 1 - (index * 0.2), 
                    x: 0, 
                    scale: 1 - (index * 0.05),
                    y: index * 80
                  }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute w-full"
                >
                  <div className="bg-glass backdrop-blur-glass border border-glass-border rounded-2xl p-6 shadow-glass">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div
                        animate={index === 0 ? { 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center"
                      >
                        <activity.icon className="w-6 h-6 text-accent" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium">
                          <span className="text-muted-foreground">{activity.user} in </span>
                          <span className="text-foreground font-semibold">{activity.location}</span>
                          <span className="text-muted-foreground"> {activity.action}</span>
                          {activity.amount && (
                            <span className="text-primary font-bold ml-1">{activity.amount}</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Just now
                        </p>
                      </div>

                      {/* Pulse Indicator */}
                      {index === 0 && (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Savers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">$25M+</p>
              <p className="text-sm text-muted-foreground mt-1">Total Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">4.9★</p>
              <p className="text-sm text-muted-foreground mt-1">User Rating</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
