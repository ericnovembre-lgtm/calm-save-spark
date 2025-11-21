import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  type: 'transaction' | 'insight' | 'automation';
  message: string;
  timestamp: Date;
  icon: any;
}

export function LiveActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'transaction',
        message: 'New transaction detected: Coffee Shop -$4.50',
        timestamp: new Date(),
        icon: DollarSign
      },
      {
        id: '2',
        type: 'insight',
        message: 'You\'re on track to save $200 this month',
        timestamp: new Date(),
        icon: TrendingUp
      },
      {
        id: '3',
        type: 'automation',
        message: 'Auto-saved $50 to Emergency Fund',
        timestamp: new Date(),
        icon: Zap
      }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockActivities.length) {
        setActivities(prev => [mockActivities[index], ...prev].slice(0, 5));
        index++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Live Activity</h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <activity.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}
