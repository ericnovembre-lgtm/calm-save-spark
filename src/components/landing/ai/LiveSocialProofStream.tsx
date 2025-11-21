import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Notification {
  id: string;
  name: string;
  location: string;
  amount: number;
  action: string;
}

const generateNotification = (): Notification => {
  const names = ['Alex', 'Jordan', 'Sam', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery'];
  const locations = ['NYC', 'LA', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver', 'Miami'];
  const actions = ['saved', 'reached goal', 'earned', 'invested'];
  
  return {
    id: Date.now().toString(),
    name: names[Math.floor(Math.random() * names.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    amount: Math.floor(Math.random() * 500) + 50,
    action: actions[Math.floor(Math.random() * actions.length)]
  };
};

export function LiveSocialProofStream() {
  const prefersReducedMotion = useReducedMotion();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        const newNotif = generateNotification();
        setNotifications(prev => [newNotif, ...prev].slice(0, 3));
      }
    }, 4000);

    // Initial notifications
    setNotifications([generateNotification()]);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div 
      className="fixed bottom-24 right-6 z-30 w-80 space-y-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-lg bg-background/95 backdrop-blur-md border border-primary/20 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                {notif.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {notif.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    from {notif.location}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notif.action === 'saved' && `Just saved $${notif.amount} 💰`}
                  {notif.action === 'reached goal' && `Reached savings goal 🎯`}
                  {notif.action === 'earned' && `Earned $${notif.amount} interest 📈`}
                  {notif.action === 'invested' && `Invested $${notif.amount} 🚀`}
                </p>
              </div>
              {notif.action === 'reached goal' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
