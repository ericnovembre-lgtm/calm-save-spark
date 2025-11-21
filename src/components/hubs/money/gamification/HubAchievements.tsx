import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
}

export function HubAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Hub Explorer',
      description: 'Visit all features in the hub',
      icon: Target,
      unlocked: false,
      progress: 3
    },
    {
      id: '2',
      title: 'Budget Master',
      description: 'Create your first budget',
      icon: Star,
      unlocked: true,
      progress: 100
    },
    {
      id: '3',
      title: 'Automation King',
      description: 'Set up 3 automation rules',
      icon: Zap,
      unlocked: false,
      progress: 66
    }
  ]);

  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    // Simulate achievement unlock
    const timer = setTimeout(() => {
      setAchievements(prev => 
        prev.map(a => a.id === '1' ? { ...a, unlocked: true, progress: 100 } : a)
      );
      setShowUnlock(true);
      setTimeout(() => setShowUnlock(false), 3000);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Hub Achievements</h3>
        </div>
        
        <div className="space-y-2">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                achievement.unlocked ? 'bg-primary/10' : 'bg-muted/50'
              }`}
            >
              <achievement.icon className={`w-5 h-5 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{achievement.title}</div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
                {!achievement.unlocked && (
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="p-8 text-center bg-primary text-primary-foreground shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
              <p className="text-lg">Hub Explorer</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
