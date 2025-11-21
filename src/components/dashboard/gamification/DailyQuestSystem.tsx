import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2, Clock, Star, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  xp: number;
  expiresIn: number; // hours
  completed: boolean;
}

export function DailyQuestSystem() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      title: 'Daily Saver',
      description: 'Transfer money to any goal',
      progress: 0,
      target: 1,
      reward: '50 XP',
      xp: 50,
      expiresIn: 18,
      completed: false
    },
    {
      id: '2',
      title: 'Goal Getter',
      description: 'Create or update 2 goals',
      progress: 1,
      target: 2,
      reward: '100 XP + Badge',
      xp: 100,
      expiresIn: 18,
      completed: false
    },
    {
      id: '3',
      title: 'Budget Boss',
      description: 'Review your spending insights',
      progress: 0,
      target: 1,
      reward: '75 XP',
      xp: 75,
      expiresIn: 18,
      completed: false
    }
  ]);

  const completeQuest = (id: string) => {
    setQuests(prev => 
      prev.map(q => 
        q.id === id 
          ? { ...q, completed: true, progress: q.target }
          : q
      )
    );
    toast.success('Quest completed! Rewards claimed!', {
      icon: <Award className="w-4 h-4" />
    });
  };

  const progressQuest = (id: string) => {
    setQuests(prev => 
      prev.map(q => 
        q.id === id && !q.completed
          ? { ...q, progress: Math.min(q.progress + 1, q.target) }
          : q
      )
    );
  };

  const totalXP = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl p-6 border border-accent/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Daily Quests</h3>
          <p className="text-sm text-muted-foreground">Complete tasks to earn XP and rewards</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalXP} XP</div>
          <div className="text-xs text-muted-foreground">Today's total</div>
        </div>
      </div>

      <div className="space-y-4">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-card rounded-xl p-4 border ${
              quest.completed 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-border'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                quest.completed 
                  ? 'bg-green-500/20' 
                  : 'bg-primary/10'
              }`}>
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Star className="w-5 h-5 text-primary" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{quest.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {quest.expiresIn}h
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{quest.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">
                      {quest.progress} / {quest.target} completed
                    </span>
                    <span className="font-medium text-primary">{quest.reward}</span>
                  </div>
                  <Progress 
                    value={(quest.progress / quest.target) * 100} 
                    className="h-2"
                  />
                </div>

                {!quest.completed && quest.progress >= quest.target && (
                  <Button
                    size="sm"
                    onClick={() => completeQuest(quest.id)}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Claim Reward
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-6 border-t border-border"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">New quests in</span>
          <span className="font-semibold">18 hours</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
