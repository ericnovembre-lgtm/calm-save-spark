import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
}

export function DailyHubQuests() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      title: 'Budget Review',
      description: 'Check your budget for this month',
      reward: '10 XP',
      completed: false
    },
    {
      id: '2',
      title: 'Transaction Check',
      description: 'Review your recent transactions',
      reward: '15 XP',
      completed: true
    },
    {
      id: '3',
      title: 'Automation Setup',
      description: 'Create a new savings automation',
      reward: '25 XP',
      completed: false
    }
  ]);

  const completeQuest = (id: string) => {
    setQuests(prev =>
      prev.map(q => q.id === id ? { ...q, completed: true } : q)
    );
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Daily Quests</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {quests.filter(q => q.completed).length}/{quests.length} completed
        </span>
      </div>
      
      <div className="space-y-2">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            layout
            className={`p-3 rounded-lg border ${
              quest.completed 
                ? 'bg-primary/10 border-primary/20' 
                : 'bg-muted/50 border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={quest.completed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {quest.completed ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.div>
              
              <div className="flex-1">
                <div className={`text-sm font-medium ${quest.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {quest.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {quest.description}
                </div>
              </div>
              
              <div className="text-xs font-bold text-primary">
                {quest.reward}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
