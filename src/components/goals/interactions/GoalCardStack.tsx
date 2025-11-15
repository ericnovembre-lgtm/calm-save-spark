import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface StackGoal {
  id: string;
  name: string;
  progress: number;
  target: number;
  current: number;
  icon?: string;
}

interface GoalCardStackProps {
  goals: StackGoal[];
  className?: string;
}

/**
 * Vertical card stack with pull-down reveal
 */
export const GoalCardStack = ({ goals, className = '' }: GoalCardStackProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 100], [1, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 50) {
      setExpandedIndex(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull hint */}
      {expandedIndex === null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
          Pull down to expand
        </motion.div>
      )}

      <div className="relative h-[400px]">
        {goals.map((goal, index) => {
          const isExpanded = expandedIndex === index;
          const stackOffset = Math.min(index * 8, 32);
          const zIndex = goals.length - index;

          return (
            <motion.div
              key={goal.id}
              className="absolute w-full cursor-pointer"
              style={{
                zIndex: isExpanded ? 999 : zIndex,
                y: isExpanded ? y : undefined,
                opacity: isExpanded ? opacity : undefined,
              }}
              initial={false}
              animate={{
                top: isExpanded ? 0 : stackOffset,
                scale: isExpanded ? 1 : 1 - index * 0.02,
              }}
              drag={isExpanded ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 200 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onClick={() => !isExpanded && setExpandedIndex(index)}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={{ scale: isExpanded ? 1 : 1.02 }}
            >
              <Card className="p-6 bg-card shadow-lg">
                {/* Goal header */}
                <div className="flex items-start gap-4 mb-4">
                  {goal.icon && (
                    <div className="text-3xl">{goal.icon}</div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-chart-1"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-semibold">
                          ${(goal.target - goal.current).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion</p>
                        <p className="font-semibold">
                          {Math.ceil((goal.target - goal.current) / (goal.current / 30))} days
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
