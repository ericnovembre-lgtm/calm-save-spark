import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
}

export function AIDailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'The $50 Coffee Challenge',
      description: 'Save $50 by making coffee at home this week',
      reward: 100,
      progress: 35,
      total: 50,
      completed: false
    },
    {
      id: '2',
      title: 'Goal Booster',
      description: 'Contribute to any savings goal today',
      reward: 50,
      progress: 0,
      total: 1,
      completed: false
    },
    {
      id: '3',
      title: 'Budget Master',
      description: 'Stay under budget in 3 categories',
      reward: 150,
      progress: 2,
      total: 3,
      completed: false
    }
  ]);

  const claimReward = (id: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === id ? { ...c, completed: true } : c))
    );
    toast.success('Challenge completed! +100 XP', { icon: <Trophy className="w-4 h-4" /> });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Daily Challenges</h3>
            <p className="text-sm text-muted-foreground">AI-generated missions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">3 Active</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {challenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-2xl p-4 ${
                challenge.completed
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-accent/50 border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                {challenge.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {challenge.progress} / {challenge.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    className={challenge.completed ? 'bg-green-500' : 'bg-primary'}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">+{challenge.reward} XP</span>
                </div>
                {challenge.progress >= challenge.total && !challenge.completed && (
                  <Button size="sm" onClick={() => claimReward(challenge.id)}>
                    Claim Reward
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl"
      >
        <p className="text-sm text-foreground">
          <span className="font-semibold">New challenges</span> generated daily based on your goals and habits
        </p>
      </motion.div>
    </motion.div>
  );
}
