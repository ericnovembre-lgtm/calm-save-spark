import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TrendingUp, Target, UserPlus, DollarSign } from "lucide-react";

interface Activity {
  id: string;
  message: string;
  icon: React.ReactNode;
  timestamp: Date;
}

const activities: Omit<Activity, "id" | "timestamp">[] = [
  { message: "Someone just saved $50", icon: <DollarSign className="w-4 h-4" /> },
  { message: "A user reached their goal!", icon: <Target className="w-4 h-4" /> },
  { message: "New user joined from California", icon: <UserPlus className="w-4 h-4" /> },
  { message: "Someone automated their savings", icon: <TrendingUp className="w-4 h-4" /> },
  { message: "A user hit $1,000 saved", icon: <DollarSign className="w-4 h-4" /> },
  { message: "New user from Texas started saving", icon: <UserPlus className="w-4 h-4" /> },
  { message: "Someone completed Week 1 challenge", icon: <Target className="w-4 h-4" /> },
  { message: "Round-ups saved $25 this week", icon: <TrendingUp className="w-4 h-4" /> },
];

export const LiveActivityTicker = () => {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityIndex, setActivityIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const showNewActivity = () => {
      const nextIndex = Math.floor(Math.random() * activities.length);
      const activity = {
        ...activities[nextIndex],
        id: `${Date.now()}-${nextIndex}`,
        timestamp: new Date(),
      };
      setCurrentActivity(activity);
      setActivityIndex(nextIndex);

      // Hide after 3 seconds
      setTimeout(() => {
        setCurrentActivity(null);
      }, 3000);
    };

    // Show first activity after 1 second
    const initialTimer = setTimeout(showNewActivity, 1000);

    // Then show new activity every 5 seconds
    const interval = setInterval(showNewActivity, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative h-16 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentActivity && (
          <motion.div
            key={currentActivity.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%", opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="flex items-center gap-3 bg-accent/10 backdrop-blur-sm rounded-full px-6 py-3 border border-accent/20"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            >
              <motion.div
                className="text-accent"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentActivity.icon}
              </motion.div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {currentActivity.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  Just now
                </span>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
