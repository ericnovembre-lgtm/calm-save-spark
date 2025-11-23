import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, ArrowRightLeft, AlertTriangle, Shield, TrendingDown } from 'lucide-react';
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
  const [displayedNarrative, setDisplayedNarrative] = useState('');

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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hedge-fund-rebalancer`,
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
      narrative?: string;
      keyRisks?: string[];
      suggestions: RebalanceSuggestion[];
      expectedImpact?: {
        volatilityReduction: number;
        diversificationScore: number;
        riskAdjustedReturn: number;
      };
      targetAllocation: Record<string, number>;
      currentDrift: number;
    }) : null;

  // Typewriter effect for narrative
  useEffect(() => {
    if (suggestionData?.narrative && displayedNarrative.length < suggestionData.narrative.length) {
      const timer = setTimeout(() => {
        setDisplayedNarrative(suggestionData.narrative!.slice(0, displayedNarrative.length + 1));
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [suggestionData?.narrative, displayedNarrative]);

  // Reset typewriter when data changes
  useEffect(() => {
    setDisplayedNarrative('');
  }, [suggestions?.id]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Hedge Fund Analysis</h3>
            <p className="text-sm text-muted-foreground">AI-powered portfolio optimization</p>
          </div>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || generateMutation.isPending}
          size="sm"
        >
          {isGenerating ? 'Analyzing...' : 'Generate Analysis'}
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
          className="space-y-6"
        >
          {/* AI Narrative */}
          {suggestionData.narrative && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border-2 border-amber-200/50"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2 text-amber-900 dark:text-amber-100">
                    Portfolio Risk Analysis
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {displayedNarrative}
                    {displayedNarrative.length < suggestionData.narrative.length && (
                      <span className="animate-pulse">▊</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Risks */}
          {suggestionData.keyRisks && suggestionData.keyRisks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Identified Risks
              </h4>
              <div className="space-y-2">
                {suggestionData.keyRisks.map((risk, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{risk}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Impact Metrics */}
          {suggestionData.expectedImpact && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <TrendingDown className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">
                  -{suggestionData.expectedImpact.volatilityReduction}%
                </div>
                <div className="text-xs text-muted-foreground">Volatility</div>
              </Card>
              <Card className="p-4 text-center">
                <Brain className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500">
                  {suggestionData.expectedImpact.diversificationScore}
                </div>
                <div className="text-xs text-muted-foreground">Diversification</div>
              </Card>
              <Card className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">
                  {suggestionData.expectedImpact.riskAdjustedReturn.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              </Card>
            </div>
          )}

          {/* Rebalancing Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Recommended Actions
            </h4>
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