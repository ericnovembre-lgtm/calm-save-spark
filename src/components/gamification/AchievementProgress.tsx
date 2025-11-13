import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp } from "lucide-react";

interface AchievementProgressProps {
  achievementId: string;
  achievementName: string;
  achievementType: string;
  requirement: any;
}

export function AchievementProgress({
  achievementId,
  achievementName,
  achievementType,
  requirement,
}: AchievementProgressProps) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["achievement-progress", achievementId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate progress based on achievement type
      let current = 0;
      let target = 0;

      switch (achievementType) {
        case "transfer_count": {
          target = requirement.count || 1;
          const { count } = await supabase
            .from("transfer_history")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "completed");
          current = count || 0;
          break;
        }

        case "savings_amount": {
          target = requirement.amount || 100;
          const { data: transfers } = await supabase
            .from("transfer_history")
            .select("amount")
            .eq("user_id", user.id)
            .eq("status", "completed");
          current = transfers?.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
          break;
        }

        case "streak_days": {
          target = requirement.days || 7;
          const { data: profile } = await supabase
            .from("profiles")
            .select("current_streak")
            .eq("id", user.id)
            .single();
          current = profile?.current_streak || 0;
          break;
        }

        case "goals_created": {
          target = requirement.count || 1;
          const { count } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          current = count || 0;
          break;
        }

        case "goal_completed": {
          target = requirement.count || 1;
          const { data: goals } = await supabase
            .from("goals")
            .select("current_amount, target_amount")
            .eq("user_id", user.id);
          current = goals?.filter(g => 
            parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))
          ).length || 0;
          break;
        }

        default:
          target = 1;
          current = 0;
      }

      const percentage = Math.min((current / target) * 100, 100);
      return { current, target, percentage };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!progress) return null;

  const isClose = progress.percentage >= 50;
  const isVeryClose = progress.percentage >= 80;

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold text-foreground">
          {progress.current} / {progress.target}
        </span>
      </div>
      
      <Progress value={progress.percentage} className="h-2" />
      
      {isVeryClose && progress.percentage < 100 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span>Almost there!</span>
        </div>
      )}
      
      {progress.percentage === 100 && (
        <Badge variant="secondary" className="text-xs">
          Ready to unlock! Complete the action to claim.
        </Badge>
      )}
    </div>
  );
}
