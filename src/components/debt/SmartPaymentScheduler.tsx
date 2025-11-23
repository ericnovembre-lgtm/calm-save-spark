import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, CheckCircle2, Sparkles, DollarSign, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface SmartPaymentSchedulerProps {
  debts: Debt[];
  userId?: string;
  onScheduleUpdate?: (debtId: string, updates: any) => void;
}

export function SmartPaymentScheduler({ debts, userId, onScheduleUpdate }: SmartPaymentSchedulerProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payment-schedule-suggestion', userId, debts.map(d => d.id).join(',')],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-optimal-payment-dates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate payment schedule');
      }
      
      return response.json();
    },
    enabled: debts.length > 0 && !!userId,
    staleTime: 3 * 24 * 60 * 60 * 1000, // 3 days
  });

  if (debts.length === 0) return null;

  const schedule = data?.schedule;
  const incomePattern = data?.incomePattern;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'emerald';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return CheckCircle2;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                Smart Payment Scheduler
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Optimal payment dates based on your cash flow
              </p>
            </div>
          </div>
          
          {!isLoading && schedule && (
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Recalculate
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
            </div>
          </div>
        )}

        {/* Income Pattern Summary */}
        {!isLoading && incomePattern && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Your Income Pattern
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Frequency</p>
                <p className="font-semibold capitalize">{incomePattern.frequency}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Typical Pay Dates</p>
                <p className="font-semibold">{incomePattern.payDates.join(', ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Avg Income</p>
                <p className="font-semibold">${incomePattern.avgAmount.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Stability</p>
                <p className="font-semibold capitalize">{incomePattern.stability}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Strategy */}
        {!isLoading && schedule?.overall_strategy && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Payment Strategy</h4>
            <p className="text-foreground">{schedule.overall_strategy}</p>
          </div>
        )}

        {/* Payment Schedule */}
        {!isLoading && schedule?.payment_schedule && schedule.payment_schedule.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Suggested Payment Dates</h4>
            <div className="space-y-3">
              {schedule.payment_schedule.map((item: any, index: number) => {
                const RiskIcon = getRiskIcon(item.risk_level);
                const riskColor = getRiskColor(item.risk_level);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-lg">{item.debt_name}</h5>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {item.current_due_date && (
                            <div>
                              <span className="text-muted-foreground">Current: </span>
                              <span className="font-semibold">{item.current_due_date}th</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Suggested: </span>
                            <span className="font-bold text-primary">{item.suggested_payment_date}th</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${riskColor}-500/10 border border-${riskColor}-500/20`}>
                        <RiskIcon className={`w-4 h-4 text-${riskColor}-600 dark:text-${riskColor}-400`} />
                        <span className={`text-sm font-semibold text-${riskColor}-600 dark:text-${riskColor}-400 capitalize`}>
                          {item.risk_level} Risk
                        </span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="p-3 rounded-lg bg-muted/30 mb-3">
                      <p className="text-sm text-muted-foreground">{item.reasoning}</p>
                    </div>

                    {/* Expected Balance */}
                    {item.expected_balance_on_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expected balance on payment date:</span>
                        <span className="font-semibold">${item.expected_balance_on_date.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    {onScheduleUpdate && (
                      <Button
                        onClick={() => onScheduleUpdate(item.debt_id, { 
                          due_date: item.suggested_payment_date 
                        })}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        Apply Suggestion
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cash Flow Warnings */}
        {!isLoading && schedule?.cash_flow_warnings && schedule.cash_flow_warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              Cash Flow Warnings
            </h4>
            <ul className="space-y-2">
              {schedule.cash_flow_warnings.map((warning: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Automation Recommendations */}
        {!isLoading && schedule?.automation_recommendations && schedule.automation_recommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="font-semibold mb-3">Automation Recommendations</h4>
            <div className="space-y-3">
              {schedule.automation_recommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{rec.debt_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rec.recommended_automation}</p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/automations'}
                    variant="outline" 
                    size="sm"
                  >
                    Set Up
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
