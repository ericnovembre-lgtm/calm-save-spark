import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Compact budget widget for mobile quick view
 * Shows total budget, spent, and remaining at a glance
 */
export const BudgetWidget = () => {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budget-widget"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("user_budgets")
        .select("total_limit, category_limits")
        .eq("user_id", session.user.id)
        .eq("period", "monthly")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: spending } = useQuery({
    queryKey: ["budget-spending-widget"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", session.user.id)
        .gte("date", startOfMonth.toISOString())
        .lt("amount", 0);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  const totalBudget = budgets?.reduce((sum, b) => sum + (b.total_limit || 0), 0) || 0;
  const totalSpent = Math.abs(spending?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Monthly Budget</h3>
        <DollarSign className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">
            ${remaining.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">
            ${totalBudget.toFixed(0)} total
          </span>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentageUsed > 90
                ? "bg-destructive"
                : percentageUsed > 75
                ? "bg-warning"
                : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {percentageUsed > 100 ? (
              <span className="flex items-center gap-1 text-destructive">
                <TrendingDown className="w-3 h-3" />
                Over budget
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {percentageUsed.toFixed(0)}% used
              </span>
            )}
          </span>
          <span className="text-muted-foreground">${totalSpent.toFixed(0)} spent</span>
        </div>
      </div>
    </Card>
  );
};
