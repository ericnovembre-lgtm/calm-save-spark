import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SpendingAlertsMiniProps {
  userId?: string;
}

const SpendingAlertsMini = ({ userId }: SpendingAlertsMiniProps) => {
  const { data: budgets } = useQuery({
    queryKey: ['budget-alerts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('user_budgets')
        .select('*, budget_spending(*)')
        .eq('user_id', userId)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!userId
  });

  const alerts = budgets?.map(budget => {
    const spending = budget.budget_spending?.[0];
    const spent = Number(spending?.spent_amount || 0);
    const limit = Number(budget.total_limit || 0);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    
    return {
      name: budget.name,
      percentage,
      isOverBudget: percentage >= 100,
      isWarning: percentage >= 80 && percentage < 100
    };
  }).filter(a => a.isOverBudget || a.isWarning) || [];

  const overBudgetCount = alerts.filter(a => a.isOverBudget).length;
  const warningCount = alerts.filter(a => a.isWarning).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Budget Alerts
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">All on track</p>
              <p className="text-xs text-muted-foreground">No budget alerts</p>
            </div>
          </div>
        ) : (
          <>
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {overBudgetCount} over budget
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {warningCount} approaching limit
                </span>
              </div>
            )}
            <div className="space-y-1">
              {alerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{alert.name}</span>
                  <span className={alert.isOverBudget ? 'text-rose-500' : 'text-amber-500'}>
                    {alert.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingAlertsMini;
