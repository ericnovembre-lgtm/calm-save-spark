import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface BudgetActivityFeedProps {
  budgetId: string;
}

export const BudgetActivityFeed = ({ budgetId }: BudgetActivityFeedProps) => {
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["budget-activity", budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_activity_log")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("budget_id", budgetId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`budget-activity-${budgetId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "budget_activity_log",
          filter: `budget_id=eq.${budgetId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [budgetId, refetch]);

  const getActionDescription = (activity: any) => {
    const actionType = activity.action_type;
    const userName = activity.profiles?.full_name || "Someone";

    switch (actionType) {
      case "INSERT":
        return `${userName} created the budget`;
      case "UPDATE":
        return `${userName} updated the budget`;
      case "DELETE":
        return `${userName} deleted the budget`;
      default:
        return `${userName} performed an action`;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Activity</h3>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {activity.profiles?.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {getActionDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Activity className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
