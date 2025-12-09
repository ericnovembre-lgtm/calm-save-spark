import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { GitBranch, TrendingUp, Target, CheckCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format, addMonths, differenceInMonths } from "date-fns";

interface GoalTimelineProps {
  userId: string;
}

export const GoalTimeline = ({ userId }: GoalTimelineProps) => {
  const { data: goals } = useQuery({
    queryKey: ['goals-timeline', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: transfers } = useQuery({
    queryKey: ['transfers-timeline', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const generateMilestones = () => {
    const milestones: any[] = [];

    // Add past transfers as milestones
    transfers?.forEach((transfer) => {
      const goal = goals?.find(g => g.id === transfer.pot_id);
      milestones.push({
        date: new Date(transfer.created_at),
        type: 'transfer',
        title: `Saved $${parseFloat(String(transfer.amount)).toFixed(0)}`,
        description: goal ? `Added to ${goal.name}` : 'Transfer completed',
        icon: 'trending-up',
        status: 'completed',
        amount: transfer.amount,
      });
    });

    // Add goal creation milestones
    goals?.forEach((goal) => {
      milestones.push({
        date: new Date(goal.created_at),
        type: 'goal_created',
        title: `Goal Created: ${goal.name}`,
        description: `Target: $${parseFloat(String(goal.target_amount)).toFixed(0)}`,
        icon: 'target',
        status: 'completed',
      });

      // Check if goal is completed
      if (parseFloat(String(goal.current_amount)) >= parseFloat(String(goal.target_amount))) {
        milestones.push({
          date: new Date(), // Approximate completion date
          type: 'goal_completed',
          title: `Goal Achieved: ${goal.name}`,
          description: `Saved $${parseFloat(String(goal.target_amount)).toFixed(0)}`,
          icon: 'check',
          status: 'completed',
        });
      }

      // Add future projections if goal has a deadline
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const currentAmount = parseFloat(String(goal.current_amount));
        const targetAmount = parseFloat(String(goal.target_amount));
        const remaining = targetAmount - currentAmount;

        if (remaining > 0 && deadline > new Date()) {
          milestones.push({
            date: deadline,
            type: 'goal_deadline',
            title: `Goal Deadline: ${goal.name}`,
            description: `$${remaining.toFixed(0)} remaining`,
            icon: 'calendar',
            status: 'future',
          });
        }
      }
    });

    // Sort by date
    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const milestones = generateMilestones();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending-up': return TrendingUp;
      case 'target': return Target;
      case 'check': return CheckCircle;
      case 'calendar': return Calendar;
      default: return GitBranch;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'future': return 'bg-amber-500';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <GitBranch className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Your Savings Journey</h2>
          <p className="text-sm text-muted-foreground">
            Track your progress and upcoming milestones
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const Icon = getIcon(milestone.icon);
            const isPast = milestone.date <= new Date();

            return (
              <motion.div
                key={`${milestone.type}-${milestone.date.getTime()}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.1, 1) }}
                className="relative flex gap-4"
              >
                {/* Timeline node */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                    milestone.status
                  )} ${isPast ? '' : 'opacity-50'}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(milestone.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    {milestone.amount && (
                      <div className="mt-2 inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                        +${parseFloat(String(milestone.amount)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {milestones.length === 0 && (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Your savings journey starts here! Create a goal and make your first transfer.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
