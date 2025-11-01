import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

export const SpendingInsights = () => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['budget_analysis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/budget-analyzer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
  });

  if (isLoading) return <LoadingState />;

  const insightIcons = {
    high_spending: TrendingUp,
    over_budget: AlertCircle,
    no_budget: Lightbulb,
    under_budget: TrendingDown,
  };

  const insightColors = {
    high_spending: 'text-blue-500',
    over_budget: 'text-red-500',
    no_budget: 'text-yellow-500',
    under_budget: 'text-green-500',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground">AI-Powered Insights</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {analysis?.insights?.map((insight: any, index: number) => {
          const Icon = insightIcons[insight.type as keyof typeof insightIcons] || Lightbulb;
          const colorClass = insightColors[insight.type as keyof typeof insightColors] || 'text-foreground';

          return (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-accent/20 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{insight.message}</p>
                  {insight.categories && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Categories: {insight.categories.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {analysis?.spending_by_category && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-foreground">Spending by Category</h4>
          <div className="space-y-3">
            {Object.entries(analysis.spending_by_category as { [key: string]: number })
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = analysis.category_percentages?.[category] || 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-accent/20 rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};
