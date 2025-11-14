import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Snail, Snowflake, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GoalEfficiencyBadgeProps {
  goalId: string;
}

const badgeConfig = {
  hot: {
    icon: Flame,
    label: "On Fire",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "You're crushing this goal! 110%+ ahead of pace."
  },
  on_track: {
    icon: Zap,
    label: "On Track",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    description: "Right on schedule! Keep up the great work."
  },
  behind: {
    icon: Snail,
    label: "Behind Pace",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    description: "A bit slower than expected. Consider boosting contributions."
  },
  frozen: {
    icon: Snowflake,
    label: "Needs Attention",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "No progress in a while. Time to jumpstart this goal!"
  }
};

export const GoalEfficiencyBadge = ({ goalId }: GoalEfficiencyBadgeProps) => {
  const { data: efficiency } = useQuery({
    queryKey: ['goal-efficiency', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_efficiency_scores')
        .select('*')
        .eq('goal_id', goalId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 60 // Refetch every hour
  });

  if (!efficiency || !efficiency.badge) return null;

  const config = badgeConfig[efficiency.badge as keyof typeof badgeConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${config.color} flex items-center gap-1 cursor-help`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">{config.description}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Efficiency Score:</span>
                <span className="font-medium">{(efficiency.efficiency_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Progress:</span>
                <span className="font-medium">{efficiency.expected_progress?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Progress:</span>
                <span className="font-medium">{efficiency.actual_progress?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};