import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RebalanceSuggestion {
  action: 'buy' | 'sell';
  symbol: string;
  amount: number;
  reason: string;
}

interface SmartRebalancingPanelProps {
  userId: string;
  portfolioData: any;
}

export function SmartRebalancingPanel({ userId, portfolioData }: SmartRebalancingPanelProps) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['rebalancing-suggestions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rebalancing_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-rebalance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ portfolioData })
        }
      );

      if (!response.ok) throw new Error('Failed to generate suggestions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rebalancing-suggestions', userId] });
      toast.success('Smart rebalancing suggestions generated!');
    },
    onError: () => {
      toast.error('Failed to generate suggestions');
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('rebalancing_suggestions')
        .update({ 
          status: 'simulated',
          executed_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rebalancing-suggestions', userId] });
      toast.success('Rebalancing simulation executed!');
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateMutation.mutateAsync();
    setIsGenerating(false);
  };

  const suggestionData = suggestions?.suggestion_data ? 
    (suggestions.suggestion_data as any as { 
      suggestions: RebalanceSuggestion[];
      targetAllocation: Record<string, number>;
      currentDrift: number;
    }) : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Smart Rebalancing</h3>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || generateMutation.isPending}
          size="sm"
        >
          {isGenerating ? 'Calculating...' : 'Generate Suggestions'}
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !suggestionData ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No rebalancing suggestions yet
          </p>
          <p className="text-sm text-muted-foreground">
            Generate smart suggestions to optimize your portfolio allocation
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {suggestionData.currentDrift && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">
                Portfolio drift: <strong>{suggestionData.currentDrift.toFixed(1)}%</strong>
              </span>
            </div>
          )}

          <div className="space-y-3">
            {suggestionData.suggestions?.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={suggestion.action === 'buy' ? 'default' : 'secondary'}>
                      {suggestion.action.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-foreground">{suggestion.symbol}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount: <strong>${suggestion.amount.toFixed(2)}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>

          <Button 
            onClick={() => executeMutation.mutate(suggestions.id)}
            disabled={executeMutation.isPending}
            className="w-full"
          >
            Simulate Rebalancing
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will simulate the rebalancing without executing real trades
          </p>
        </motion.div>
      )}
    </Card>
  );
}