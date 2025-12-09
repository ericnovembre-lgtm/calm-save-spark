import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface RebalancingSuggestion {
  from: {
    budgetId: string;
    name: string;
    projectedSurplus: number;
  };
  to: {
    budgetId: string;
    name: string;
    projectedShortage: number;
  };
  amount: number;
  confidence: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
  impact: string;
  alternativeActions?: string[];
}

export function SmartRebalancingAgent() {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const [dismissalReasons, setDismissalReasons] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['rebalancing-suggestions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const response = await supabase.functions.invoke('suggest-budget-rebalancing');
      if (response.error) throw response.error;
      return response.data?.suggestions || [];
    },
    refetchInterval: 1000 * 60 * 60 * 6, // Every 6 hours
    staleTime: 1000 * 60 * 60 * 6,
  });

  const applyRebalancingMutation = useMutation({
    mutationFn: async (suggestion: RebalancingSuggestion) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('transfer-budget-funds', {
        body: {
          from_budget_id: suggestion.from.budgetId,
          to_budget_id: suggestion.to.budgetId,
          amount: suggestion.amount,
          reason: suggestion.reasoning
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: async (_, suggestion) => {
      // Log feedback
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('budget_rebalancing_feedback').insert({
          user_id: session.user.id,
          suggestion_id: `${suggestion.from.budgetId}-${suggestion.to.budgetId}`,
          action: 'applied',
          feedback_reason: 'accepted'
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['user_budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget_spending'] });
      queryClient.invalidateQueries({ queryKey: ['rebalancing-suggestions'] });
      toast.success(`✨ Moved $${suggestion.amount.toFixed(2)} from ${suggestion.from.name} to ${suggestion.to.name}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to rebalance budgets');
    }
  });

  const activeSuggestions = suggestions.filter(
    (s: RebalancingSuggestion) => !dismissedSuggestions.has(`${s.from.budgetId}-${s.to.budgetId}`)
  );

  const handleDismiss = async (suggestionId: string, reason: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('budget_rebalancing_feedback').insert({
        user_id: session.user.id,
        suggestion_id: suggestionId,
        action: 'dismissed',
        feedback_reason: reason as any
      });
    }
    setDismissedSuggestions(prev => new Set(prev).add(suggestionId));
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">Very Confident</span>;
    } else if (confidence >= 0.7) {
      return <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-medium">Confident</span>;
    } else {
      return <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-600 text-xs font-medium">Tentative</span>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-600',
      medium: 'bg-orange-500/20 text-orange-600',
      low: 'bg-amber-500/20 text-amber-600'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[urgency as keyof typeof colors]}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Urgency
      </span>
    );
  };

  if (activeSuggestions.length === 0) return null;

  return (
    <AnimatePresence>
      {activeSuggestions.slice(0, 2).map((suggestion: RebalancingSuggestion, index: number) => {
        const suggestionId = `${suggestion.from.budgetId}-${suggestion.to.budgetId}`;
        const isExpanded = expandedReasoning === suggestionId;
        
        return (
          <motion.div
            key={suggestionId}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 bg-gradient-to-br from-yellow-500/10 via-primary/10 to-amber-500/10 border-2 backdrop-blur-sm ${
              suggestion.urgency === 'high' ? 'border-red-500/40 shadow-lg shadow-red-500/20' : 'border-yellow-500/30'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center"
                    animate={suggestion.urgency === 'high' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">Smart Rebalancing Suggestion</h3>
                      {getConfidenceBadge(suggestion.confidence)}
                      {getUrgencyBadge(suggestion.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => {
                    if (!dismissalReasons[suggestionId]) {
                      setDismissalReasons(prev => ({ ...prev, [suggestionId]: 'show' }));
                    } else {
                      handleDismiss(suggestionId, 'other');
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Dismissal Reason Selection */}
              {dismissalReasons[suggestionId] === 'show' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 rounded-lg bg-muted/50"
                >
                  <p className="text-sm font-medium mb-2">Why not helpful?</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'amount_too_high', label: 'Amount too high' },
                      { value: 'wrong_priority', label: 'Category priority wrong' },
                      { value: 'bad_timing', label: 'Timing not right' },
                      { value: 'other', label: 'Other reason' }
                    ].map(reason => (
                      <Button
                        key={reason.value}
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(suggestionId, reason.value)}
                      >
                        {reason.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <p className="font-semibold">{suggestion.from.name}</p>
                  <p className="text-sm text-emerald-500 mt-1 font-mono tabular-nums">
                    ${suggestion.from.projectedSurplus.toFixed(2)} projected surplus
                  </p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                
                <div className="flex-1 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <p className="font-semibold">{suggestion.to.name}</p>
                  <p className="text-sm text-rose-500 mt-1 font-mono tabular-nums">
                    ${suggestion.to.projectedShortage.toFixed(2)} projected shortage
                  </p>
                </div>
              </div>

              {/* Impact Visualization */}
              <div className="mb-4 p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-2">Impact</p>
                <p className="text-sm text-muted-foreground">{suggestion.impact}</p>
              </div>

              {/* Alternative Actions */}
              {suggestion.alternativeActions && suggestion.alternativeActions.length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium mb-2">Alternative Options</p>
                  <ul className="space-y-1">
                    {suggestion.alternativeActions.map((action, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transfer amount</p>
                  <p className="text-2xl font-bold text-primary font-mono tabular-nums">
                    ${suggestion.amount.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => applyRebalancingMutation.mutate(suggestion)}
                  disabled={applyRebalancingMutation.isPending}
                  className="gap-2"
                >
                  {applyRebalancingMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Apply Rebalancing
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
