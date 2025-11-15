import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, Calendar, Target } from 'lucide-react';
import { MultiRingProgress } from '../visualization/MultiRingProgress';

interface CompareGoal {
  id: string;
  name: string;
  icon?: string;
  progress: number;
  current: number;
  target: number;
  deadline?: string;
  monthlyContribution: number;
  weeklyContribution: number;
}

interface GoalCompareViewProps {
  goals: [CompareGoal, CompareGoal];
  onClose: () => void;
  className?: string;
}

/**
 * Split-screen goal comparison with animated transition
 */
export const GoalCompareView = ({ 
  goals, 
  onClose,
  className = '' 
}: GoalCompareViewProps) => {
  const [goalA, goalB] = goals;

  const ComparisonMetric = ({ 
    label, 
    valueA, 
    valueB, 
    icon: Icon 
  }: { 
    label: string; 
    valueA: string; 
    valueB: string; 
    icon: any;
  }) => (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center py-3 border-b last:border-0">
      <div className="text-right">
        <p className="font-semibold">{valueA}</p>
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground text-center">{label}</p>
      </div>
      <div className="text-left">
        <p className="font-semibold">{valueB}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-50 ${className}`}
    >
      <div className="container mx-auto h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Compare Goals</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Split view */}
        <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-auto">
          {/* Goal A */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                {goalA.icon && <span className="text-3xl">{goalA.icon}</span>}
                <h3 className="text-xl font-bold">{goalA.name}</h3>
              </div>

              <div className="flex justify-center mb-6">
                <MultiRingProgress
                  current={goalA.current}
                  target={goalA.target}
                  monthlyContribution={goalA.monthlyContribution}
                  weeklyContribution={goalA.weeklyContribution}
                  size={200}
                />
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    ${goalA.current.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ${goalA.target.toLocaleString()}
                  </p>
                </div>

                {goalA.deadline && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(goalA.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Goal B */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                {goalB.icon && <span className="text-3xl">{goalB.icon}</span>}
                <h3 className="text-xl font-bold">{goalB.name}</h3>
              </div>

              <div className="flex justify-center mb-6">
                <MultiRingProgress
                  current={goalB.current}
                  target={goalB.target}
                  monthlyContribution={goalB.monthlyContribution}
                  weeklyContribution={goalB.weeklyContribution}
                  size={200}
                />
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    ${goalB.current.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ${goalB.target.toLocaleString()}
                  </p>
                </div>

                {goalB.deadline && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(goalB.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Comparison metrics */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Side-by-Side Comparison
            </h3>
            <ComparisonMetric
              label="Progress"
              valueA={`${goalA.progress}%`}
              valueB={`${goalB.progress}%`}
              icon={TrendingUp}
            />
            <ComparisonMetric
              label="Target"
              valueA={`$${goalA.target.toLocaleString()}`}
              valueB={`$${goalB.target.toLocaleString()}`}
              icon={Target}
            />
            <ComparisonMetric
              label="Remaining"
              valueA={`$${(goalA.target - goalA.current).toLocaleString()}`}
              valueB={`$${(goalB.target - goalB.current).toLocaleString()}`}
              icon={Target}
            />
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
