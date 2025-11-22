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
    surplus: number;
  };
  to: {
    budgetId: string;
    name: string;
    shortage: number;
  };
  amount: number;
  confidence: number;
  reason: string;
}

export function SmartRebalancingAgent() {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
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
          reason: suggestion.reason
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, suggestion) => {
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

  if (activeSuggestions.length === 0) return null;

  return (
    <AnimatePresence>
      {activeSuggestions.slice(0, 2).map((suggestion: RebalancingSuggestion, index: number) => (
        <motion.div
          key={`${suggestion.from.budgetId}-${suggestion.to.budgetId}`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-primary/10 to-blue-500/10 border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Smart Rebalancing Suggestion
                    <span className="text-xs font-normal text-muted-foreground">
                      {(suggestion.confidence * 100).toFixed(0)}% confident
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setDismissedSuggestions(prev => new Set(prev).add(`${suggestion.from.budgetId}-${suggestion.to.budgetId}`));
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-semibold">{suggestion.from.name}</p>
                <p className="text-sm text-emerald-500 mt-1 font-mono tabular-nums">
                  ${suggestion.from.surplus.toFixed(2)} surplus
                </p>
              </div>
              
              <ArrowRight className="w-5 h-5 text-primary" />
              
              <div className="flex-1 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-semibold">{suggestion.to.name}</p>
                <p className="text-sm text-rose-500 mt-1 font-mono tabular-nums">
                  ${suggestion.to.shortage.toFixed(2)} short
                </p>
              </div>
            </div>

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
      ))}
    </AnimatePresence>
  );
}
