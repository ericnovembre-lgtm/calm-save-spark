import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle2, XCircle, AlertTriangle, Sparkles, TrendingDown, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface DebtConsolidationAnalyzerProps {
  debts: Debt[];
  userId?: string;
}

export function DebtConsolidationAnalyzer({ debts, userId }: DebtConsolidationAnalyzerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['debt-consolidation-analysis', userId, debts.map(d => d.id).join(',')],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-debt-consolidation`,
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
        throw new Error(error.error || 'Failed to analyze consolidation');
      }
      
      return response.json();
    },
    enabled: debts.length > 1 && !!userId && isExpanded,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  if (debts.length <= 1) return null;

  const analysis = data?.analysis;
  const metrics = data?.currentMetrics;

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'consolidate': return 'emerald';
      case 'keep_separate': return 'blue';
      case 'partial_consolidate': return 'yellow';
      default: return 'gray';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'consolidate': return 'Yes, Consolidate';
      case 'keep_separate': return 'Keep Separate';
      case 'partial_consolidate': return 'Partial Consolidation';
      default: return 'Analyzing...';
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Should I consolidate my debts?
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You're paying {debts.length} creditors at {metrics ? `${metrics.weightedAPR.toFixed(1)}% avg APR` : 'multiple rates'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {analysis && !isLoading && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getRecommendationColor(analysis.recommendation)}-500/10 text-${getRecommendationColor(analysis.recommendation)}-600 dark:text-${getRecommendationColor(analysis.recommendation)}-400`}>
              {getRecommendationLabel(analysis.recommendation)}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border"
          >
            <div className="p-6 space-y-6">
              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-muted rounded-lg" />
                  <div className="h-32 bg-muted rounded-lg" />
                  <div className="h-32 bg-muted rounded-lg" />
                </div>
              )}

              {!isLoading && analysis && (
                <>
                  {/* Recommendation Badge */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Recommendation</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <span className="font-bold text-primary">{analysis.confidence_score}%</span>
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${getRecommendationColor(analysis.recommendation)}-500/20 border border-${getRecommendationColor(analysis.recommendation)}-500/30`}>
                      <span className={`text-lg font-bold text-${getRecommendationColor(analysis.recommendation)}-600 dark:text-${getRecommendationColor(analysis.recommendation)}-400`}>
                        {getRecommendationLabel(analysis.recommendation)}
                      </span>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.confidence_score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  {/* Best Option Details */}
                  {analysis.best_option && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 border-primary/30">
                        <h5 className="font-semibold mb-3 text-sm text-muted-foreground">Recommended Option</h5>
                        <p className="text-lg font-bold text-primary mb-4 capitalize">
                          {analysis.best_option.type.replace('_', ' ')}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated APR:</span>
                            <span className="font-semibold">{analysis.best_option.estimated_apr}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <span className="font-semibold">${analysis.best_option.monthly_payment.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interest Saved:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ${analysis.best_option.total_interest_saved.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payoff Time:</span>
                            <span className="font-semibold">{analysis.best_option.payoff_months} months</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 border-border">
                        <h5 className="font-semibold mb-3 text-sm text-muted-foreground">Current Structure</h5>
                        <p className="text-lg font-bold text-foreground mb-4">
                          {metrics?.numCreditors} Separate Debts
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg APR:</span>
                            <span className="font-semibold">{metrics?.weightedAPR.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <span className="font-semibold">${metrics?.totalMonthlyPayment.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Debt:</span>
                            <span className="font-semibold">${metrics?.totalDebt.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Creditors:</span>
                            <span className="font-semibold">{metrics?.numCreditors}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pros */}
                    {analysis.pros && analysis.pros.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Pros for You
                        </h4>
                        <div className="space-y-2">
                          {analysis.pros.map((pro: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground">{pro}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cons */}
                    {analysis.cons && analysis.cons.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <XCircle className="w-4 h-4" />
                          Cons to Consider
                        </h4>
                        <div className="space-y-2">
                          {analysis.cons.map((con: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10"
                            >
                              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground">{con}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Factors */}
                  {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-2">
                        {analysis.risk_factors.map((risk: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lender Suggestions */}
                  {analysis.lender_suggestions && analysis.lender_suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Suggested Lenders</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {analysis.lender_suggestions.map((lender: any, index: number) => (
                          <Card key={index} className="p-4 hover:border-primary/50 transition-colors">
                            <h5 className="font-semibold mb-2">{lender.name}</h5>
                            <p className="text-xs text-muted-foreground mb-3 capitalize">{lender.type}</p>
                            <div className="space-y-2 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">APR:</span>
                                <span className="ml-2 font-semibold">{lender.apr_range}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="ml-2 font-semibold">{lender.loan_amount_range}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{lender.why_recommended}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {analysis.next_steps && analysis.next_steps.length > 0 && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold mb-3">Next Steps</h4>
                      <ol className="space-y-2 list-decimal list-inside">
                        {analysis.next_steps.map((step: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Refresh Analysis
                    </Button>
                    <Button 
                      onClick={() => navigate('/coach', { 
                        state: { initialMessage: `I'm considering consolidating my debts. Can you help me understand if it's the right move for me? I have ${debts.length} debts totaling $${metrics?.totalDebt.toFixed(2)}.` }
                      })}
                      className="gap-2"
                    >
                      Talk to Debt Coach
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
