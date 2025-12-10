import { motion } from 'framer-motion';
import { Target, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { SharedGoal, useSharedGoals } from '@/hooks/useSharedGoals';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SharedGoalCardProps {
  share: SharedGoal;
  index: number;
  type: 'shared-with-me' | 'shared-by-me';
}

export function SharedGoalCard({ share, index, type }: SharedGoalCardProps) {
  const { removeShare } = useSharedGoals();
  const goal = share.goal;

  if (!goal) return null;

  const progress = (goal.current_amount / goal.target_amount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
            {goal.icon || '🎯'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{goal.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                share.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-500'
                  : share.status === 'accepted'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {share.status}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>${goal.current_amount.toLocaleString()}</span>
              <span>/</span>
              <span>${goal.target_amount.toLocaleString()}</span>
            </div>

            <Progress value={progress} className="h-2 mt-2" />

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {type === 'shared-with-me' 
                    ? `Shared by owner` 
                    : `Shared with ${share.permission_level}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {type === 'shared-by-me' && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => removeShare.mutate(share.id)}
              >
                Remove Share
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
