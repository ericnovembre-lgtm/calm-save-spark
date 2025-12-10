import { motion } from 'framer-motion';
import { Trophy, Target, Rocket, Star, Award, Zap, Share2 } from 'lucide-react';
import { UserMilestone } from '@/hooks/useUserMilestones';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, typeof Trophy> = {
  trophy: Trophy,
  target: Target,
  rocket: Rocket,
  star: Star,
  award: Award,
  zap: Zap,
};

interface MilestoneCardProps {
  milestone: UserMilestone;
  index: number;
}

export function MilestoneCard({ milestone, index }: MilestoneCardProps) {
  const Icon = iconMap[milestone.milestone_icon || 'star'] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative p-4 rounded-xl bg-card border border-border hover:border-amber-500/30 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium">{milestone.milestone_name}</h4>
              {milestone.milestone_description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {milestone.milestone_description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {milestone.milestone_type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(milestone.completed_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
