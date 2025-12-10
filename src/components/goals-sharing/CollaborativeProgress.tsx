import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { useSharedGoals } from '@/hooks/useSharedGoals';
import { Progress } from '@/components/ui/progress';

export function CollaborativeProgress() {
  const { sharedWithMe, sharedByMe } = useSharedGoals();
  
  // Calculate combined progress for collaborative goals
  const allShares = [...sharedWithMe, ...sharedByMe].filter(s => s.status === 'accepted');
  
  const totalTarget = allShares.reduce((sum, s) => sum + (s.goal?.target_amount || 0), 0);
  const totalCurrent = allShares.reduce((sum, s) => sum + (s.goal?.current_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  if (allShares.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">No Collaborative Goals Yet</h3>
        <p className="text-sm text-muted-foreground">
          Share goals with friends and family to track progress together
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Collaborative Progress</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-lg bg-muted/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Combined Saved</span>
          </div>
          <p className="text-2xl font-bold">${totalCurrent.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-muted/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Combined Target</span>
          </div>
          <p className="text-2xl font-bold">${totalTarget.toLocaleString()}</p>
        </motion.div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-medium">{overallProgress.toFixed(1)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Active Shared Goals</span>
          <span className="font-medium">{allShares.length}</span>
        </div>
      </div>
    </div>
  );
}
