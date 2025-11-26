import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  overallProgress: number;
  nextMilestone: any;
  creditScore: number | null;
}

export function WealthProgressOverview({ overallProgress, nextMilestone, creditScore }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const remaining = nextMilestone 
    ? nextMilestone.target_amount - nextMilestone.current_amount 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Wealth Progress Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                Your financial growth at a glance
              </p>
            </div>
            
            {/* Progress Ring */}
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  className="text-primary"
                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                  animate={{ 
                    strokeDashoffset: prefersReducedMotion 
                      ? 2 * Math.PI * 32 * (1 - overallProgress / 100)
                      : 2 * Math.PI * 32 * (1 - overallProgress / 100)
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Goals Progress */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Goals</p>
                <p className="font-semibold">{Math.round(overallProgress)}% Complete</p>
              </div>
            </div>

            {/* Credit Health */}
            {creditScore && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  creditScore >= 750 ? 'bg-green-500/10' :
                  creditScore >= 650 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${
                    creditScore >= 750 ? 'text-green-500' :
                    creditScore >= 650 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Health</p>
                  <p className="font-semibold">{creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Good' : 'Fair'}</p>
                </div>
              </div>
            )}

            {/* Next Milestone */}
            {nextMilestone && remaining > 0 && (
              <Link 
                to="/goals" 
                className="md:col-span-2 flex items-center justify-between p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Milestone</p>
                  <p className="font-semibold">{nextMilestone.name || 'Goal'}</p>
                  <p className="text-sm text-primary mt-1">
                    ${remaining.toFixed(2)} to go
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
