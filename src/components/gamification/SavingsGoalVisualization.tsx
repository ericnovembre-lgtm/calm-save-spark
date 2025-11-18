import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface SavingsGoalVisualizationProps {
  goalId: string;
}

export function SavingsGoalVisualization({ goalId }: SavingsGoalVisualizationProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: goal } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['savings_milestones', goalId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('savings_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('milestone_percentage', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const progress = goal ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const milestonePercentages = [25, 50, 75, 100];

  useEffect(() => {
    // Check if we just hit a new milestone
    const latestMilestone = milestones.find(
      m => !m.is_celebrated && m.reached_at && m.milestone_percentage <= progress
    );

    if (latestMilestone) {
      setShowCelebration(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Mark as celebrated
      supabase
        .from('savings_milestones')
        .update({ is_celebrated: true })
        .eq('id', latestMilestone.id);

      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [milestones, progress]);

  if (!goal) return null;

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Milestone Reached! 🎉</h3>
              <p className="text-muted-foreground">You're making great progress!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{goal.name}</h3>
        <Badge variant="outline" className="ml-auto">
          {progress.toFixed(1)}%
        </Badge>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="relative mb-6">
        <Progress value={progress} className="h-4" />
        
        {/* Milestone Markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {milestonePercentages.map((percentage) => {
            const isReached = progress >= percentage;
            const milestone = milestones.find(m => m.milestone_percentage === percentage);
            
            return (
              <motion.div
                key={percentage}
                className="relative flex flex-col items-center"
                style={{ left: `${percentage}%` }}
                whileHover={{ scale: 1.2 }}
              >
                <motion.div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isReached
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-muted-foreground'
                  }`}
                  animate={isReached ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {isReached && <span className="text-xs">✓</span>}
                </motion.div>
                <span className="text-xs mt-1 text-muted-foreground">{percentage}%</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Amount Display */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">
            ${goal.current_amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Saved</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">
            ${goal.target_amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Goal</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">
            ${(goal.target_amount - goal.current_amount).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>

      {/* Projection */}
      {goal.current_amount > 0 && progress < 100 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-muted-foreground">
              At your current pace, you'll reach your goal in{' '}
              <span className="font-semibold text-foreground">
                {Math.ceil((goal.target_amount - goal.current_amount) / (goal.current_amount / 30))} days
              </span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
