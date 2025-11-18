import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Target, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface PayoffTimelineProps {
  debts: Debt[];
  userId?: string;
}

export default function PayoffTimeline({ debts }: PayoffTimelineProps) {
  // Calculate milestones
  const totalOriginal = debts.reduce((sum, d) => sum + Number(d.original_balance || d.current_balance), 0);
  const totalCurrent = debts.reduce((sum, d) => sum + Number(d.current_balance), 0);
  const totalPaid = totalOriginal - totalCurrent;
  const progressPercent = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  const milestones = [
    { percent: 25, label: '25% Paid Off', achieved: progressPercent >= 25, icon: CheckCircle },
    { percent: 50, label: '50% Paid Off', achieved: progressPercent >= 50, icon: CheckCircle },
    { percent: 75, label: '75% Paid Off', achieved: progressPercent >= 75, icon: CheckCircle },
    { percent: 100, label: 'Debt Free!', achieved: progressPercent >= 100, icon: Target },
  ];

  if (debts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Add debts to see your payoff timeline</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Your Debt-Free Journey</h3>
            <p className="text-muted-foreground mt-1">
              {progressPercent.toFixed(1)}% Complete
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              ${totalPaid.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">paid off</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute h-full bg-gradient-to-r from-primary to-secondary"
          />
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Milestones</h3>
        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const Icon = milestone.achieved ? CheckCircle : milestone.icon;
            return (
              <motion.div
                key={milestone.percent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`p-3 rounded-full ${milestone.achieved ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-6 h-6 ${milestone.achieved ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${milestone.achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {milestone.label}
                    </h4>
                    <span className={`text-sm ${milestone.achieved ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {milestone.percent}%
                    </span>
                  </div>
                  {milestone.achieved && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Completed! Keep going! 🎉
                    </p>
                  )}
                  {!milestone.achieved && progressPercent < milestone.percent && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${((totalOriginal * milestone.percent / 100) - totalPaid).toLocaleString()} to go
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Individual Debt Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Individual Debt Progress
        </h3>
        <div className="space-y-4">
          {debts.map((debt) => {
            const debtProgress = debt.original_balance 
              ? ((Number(debt.original_balance) - Number(debt.current_balance)) / Number(debt.original_balance)) * 100 
              : 0;
            
            return (
              <div key={debt.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{debt.debt_name}</span>
                  <span className="text-sm text-muted-foreground">{debtProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(debtProgress, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>${Number(debt.current_balance).toLocaleString()} remaining</span>
                  <span>of ${Number(debt.original_balance || debt.current_balance).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
