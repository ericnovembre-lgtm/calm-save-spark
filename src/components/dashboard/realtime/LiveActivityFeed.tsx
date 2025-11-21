import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  type: 'transfer' | 'goal' | 'achievement' | 'milestone';
  message: string;
  timestamp: Date;
  icon: typeof TrendingUp;
  color: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate real-time activity stream
    const interval = setInterval(() => {
      const activityTypes = [
        {
          type: 'transfer' as const,
          messages: ['$100 transferred to Emergency Fund', '$50 auto-saved', '$200 added to Vacation fund'],
          icon: DollarSign,
          color: '#10b981'
        },
        {
          type: 'goal' as const,
          messages: ['Vacation goal 75% complete', 'New car goal created', 'Emergency fund reached!'],
          icon: Target,
          color: '#3b82f6'
        },
        {
          type: 'achievement' as const,
          messages: ['First $1000 saved!', '30-day streak achieved', 'Goal Master badge unlocked'],
          icon: Award,
          color: '#f59e0b'
        },
        {
          type: 'milestone' as const,
          messages: ['$5000 milestone reached', 'Total balance doubled', '100 transactions completed'],
          icon: TrendingUp,
          color: '#8b5cf6'
        }
      ];

      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

      const newActivity: Activity = {
        id: Date.now().toString(),
        type: randomType.type,
        message: randomMessage,
        timestamp: new Date(),
        icon: randomType.icon,
        color: randomType.color
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const dismissActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-40 w-80 max-w-[calc(100vw-3rem)] space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            layout
            className="bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${activity.color}20` }}
              >
                <activity.icon
                  className="w-4 h-4"
                  style={{ color: activity.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">{activity.message}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => dismissActivity(activity.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
