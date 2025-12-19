import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useBudgetMutations } from '@/hooks/useBudgetMutations';

interface InflationAlert {
  id: string;
  budget_id: string;
  category: string;
  old_budget: number;
  suggested_budget: number;
  evidence: any; // Json type from Supabase
  reason: string;
  status: string;
}

export function InflationDetector() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const { updateBudget } = useBudgetMutations(userId);

  const { data: alerts = [] } = useQuery({
    queryKey: ['inflation-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('budget_inflation_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 1000 * 60 * 60, // Check hourly
  });

  const updateBudgetFromAlert = useMutation({
    mutationFn: async ({ alertId, budgetId, newLimit }: { alertId: string; budgetId: string; newLimit: number }) => {
      // Use centralized hook for Algolia sync
      await updateBudget.mutateAsync({ id: budgetId, updates: { total_limit: newLimit } });

      const { error: alertError } = await supabase
        .from('budget_inflation_alerts')
        .update({ status: 'accepted' })
        .eq('id', alertId);

      if (alertError) throw alertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inflation-alerts'] });
    },
    onError: () => {
      toast.error('Failed to update budget');
    }
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('budget_inflation_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inflation-alerts'] });
    }
  });

  const activeAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activeAlerts.map((alert: InflationAlert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <Alert className="border-amber-500/50 bg-amber-500/10 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <AlertDescription className="mt-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Budget Inflation Detected: {alert.category}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current budget:</span>
                        <span className="ml-2 font-semibold font-mono tabular-nums">${alert.old_budget.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Suggested:</span>
                        <span className="ml-2 font-semibold text-amber-500 font-mono tabular-nums">
                          ${alert.suggested_budget.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent history:</p>
                      {Array.isArray(alert.evidence) && alert.evidence.map((ev: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{ev.month}</span>
                          <div className="flex items-center gap-3 font-mono tabular-nums">
                            <span>${ev.amount.toFixed(2)}</span>
                            <span className="text-amber-500">
                              ({ev.overage > 0 ? '+' : ''}{ev.overage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => updateBudgetFromAlert.mutate({
                        alertId: alert.id,
                        budgetId: alert.budget_id,
                        newLimit: alert.suggested_budget
                      })}
                      disabled={updateBudgetFromAlert.isPending}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Update Budget
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlertMutation.mutate(alert.id)}
                      className="gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Remind Later
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDismissed(prev => new Set(prev).add(alert.id));
                        dismissAlertMutation.mutate(alert.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
