import { motion } from 'framer-motion';
import { Target, TrendingUp, Zap, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PredictedMilestone {
  id: string;
  name: string;
  description: string;
  progress: number;
  estimatedDate: string;
  icon: 'target' | 'trending' | 'zap';
}

// This would come from AI predictions based on user behavior
const mockPredictions: PredictedMilestone[] = [
  {
    id: '1',
    name: 'First $1,000 Saved',
    description: 'Reach your first savings milestone',
    progress: 75,
    estimatedDate: '2 weeks',
    icon: 'target',
  },
  {
    id: '2',
    name: '30-Day Streak',
    description: 'Save consistently for 30 days',
    progress: 60,
    estimatedDate: '12 days',
    icon: 'zap',
  },
  {
    id: '3',
    name: 'Budget Master',
    description: 'Stay under budget for 3 months',
    progress: 40,
    estimatedDate: '1 month',
    icon: 'trending',
  },
];

const iconMap = {
  target: Target,
  trending: TrendingUp,
  zap: Zap,
};

export function UpcomingMilestones() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Upcoming Milestones</h3>
      </div>

      <div className="space-y-3">
        {mockPredictions.map((milestone, index) => {
          const Icon = iconMap[milestone.icon];
          
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm">{milestone.name}</h4>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ~{milestone.estimatedDate}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={milestone.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.progress}% complete
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
