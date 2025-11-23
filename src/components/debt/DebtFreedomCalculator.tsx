import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, AlertCircle, Sparkles, Target, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface DebtFreedomCalculatorProps {
  debts: Debt[];
  userId?: string;
  currentStrategy: 'avalanche' | 'snowball';
}

export function DebtFreedomCalculator({ debts, userId, currentStrategy }: DebtFreedomCalculatorProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['debt-freedom-prediction', userId, debts.map(d => d.id).join(',')],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-debt-freedom-date`,
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
        throw new Error(error.error || 'Failed to predict debt freedom date');
      }
      
      return response.json();
    },
    enabled: debts.length > 0 && !!userId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (debts.length === 0) return null;

  const prediction = data?.prediction;
  const needsData = data?.needsData || !data?.dataQuality?.hasTransactions;

  return (
    <Card className="p-6 overflow-hidden relative border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                Debt Freedom Calculator
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground">AI-powered prediction based on your habits</p>
            </div>
          </div>
          
          {!isLoading && prediction && (
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Recalculate
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          </div>
        )}

        {/* Need More Data State */}
        {!isLoading && needsData && (
          <div className="text-center py-8 space-y-4">
            <div className="p-4 rounded-full bg-yellow-500/10 w-16 h-16 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Need More Financial Data</h4>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Connect your bank accounts and track payments for at least 30 days to get an accurate prediction
              </p>
            </div>
            <Button onClick={() => window.location.href = '/accounts'} variant="outline">
              Connect Accounts
            </Button>
          </div>
        )}

        {/* Prediction Display */}
        {!isLoading && prediction && !needsData && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hero Date Display */}
              <div className="text-center py-6 px-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Predicted Debt-Free Date</p>
                <h2 className="text-4xl font-bold text-primary mb-2">
                  {format(new Date(prediction.predicted_date), 'MMMM yyyy')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {prediction.months_to_freedom} months from now
                </p>
                
                {/* Confidence Meter */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">{prediction.confidence_level}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence_level}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        prediction.confidence_level > 70 ? 'bg-emerald-500' :
                        prediction.confidence_level > 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Key Factors */}
              {prediction.key_factors && prediction.key_factors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Key Factors
                  </h4>
                  <div className="space-y-2">
                    {prediction.key_factors.map((factor: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground">{factor}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acceleration Opportunities */}
              {prediction.acceleration_opportunities && prediction.acceleration_opportunities.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-4 h-4" />
                    Accelerate Your Freedom
                  </h4>
                  <div className="space-y-3">
                    {prediction.acceleration_opportunities.map((opp: any, index: number) => (
                      <div key={index} className="flex items-start justify-between gap-4">
                        <p className="text-sm text-foreground">{opp.action}</p>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            Save {opp.time_saved_months}mo
                          </p>
                          {opp.potential_savings > 0 && (
                            <p className="text-xs text-muted-foreground">
                              ${opp.potential_savings.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {prediction.risks && prediction.risks.length > 0 && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    Potential Delays
                  </h4>
                  <div className="space-y-2">
                    {prediction.risks.map((risk: string, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
                        {risk}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Best/Worst Case */}
              {(prediction.best_case_date || prediction.worst_case_date) && (
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  {prediction.best_case_date && (
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Best Case</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {format(new Date(prediction.best_case_date), 'MMM yyyy')}
                      </p>
                    </div>
                  )}
                  {prediction.worst_case_date && (
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Worst Case</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        {format(new Date(prediction.worst_case_date), 'MMM yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
