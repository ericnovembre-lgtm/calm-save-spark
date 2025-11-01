import { AppLayout } from "@/components/layout/AppLayout";
import { BudgetBuilder } from "@/components/insights/BudgetBuilder";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";

export default function Budget() {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['user_budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_budgets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Budget Manager</h1>
          <p className="text-muted-foreground">Create and track your personalized budget</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <BudgetBuilder />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Your Budgets</h3>
            
            {isLoading ? (
              <LoadingState />
            ) : budgets?.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No budgets yet. Create one to get started!</p>
              </Card>
            ) : (
              budgets?.map((budget) => {
                const categoryLimits = budget.category_limits as { [key: string]: number };
                return (
                  <Card key={budget.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{budget.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                      </div>
                      {budget.is_active && (
                        <Badge>Active</Badge>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-foreground">
                        ${parseFloat(String(budget.total_limit)).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(categoryLimits).map(([category, limit]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{category}</span>
                          <span className="font-medium text-foreground">${limit.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
