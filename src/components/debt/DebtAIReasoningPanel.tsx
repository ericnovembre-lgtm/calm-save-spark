import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Brain, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelIndicatorBadge } from '@/components/coach/ModelIndicatorBadge';

interface DebtAllocation {
  debt_name: string;
  recommended_extra_payment: number;
  mathematical_reasoning: string;
}

interface AIRecommendations {
  recommended_strategy: 'avalanche' | 'snowball' | 'hybrid';
  mathematical_proof?: string;
  optimal_allocation?: DebtAllocation[];
  hybrid_recommendation?: string | null;
  breakeven_extra_payment?: number;
  interest_savings_vs_alternative?: number;
  time_savings_months?: number;
  psychological_score?: number;
  key_insight?: string;
  insight_message?: string;
  urgency_level?: 'low' | 'medium' | 'high';
}

interface DebtAIReasoningPanelProps {
  recommendations: AIRecommendations | null;
  reasoningChain: string | null;
  isLoading?: boolean;
}

export function DebtAIReasoningPanel({ 
  recommendations, 
  reasoningChain, 
  isLoading 
}: DebtAIReasoningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 animate-pulse flex items-center justify-center">
            <Brain className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-amber-500/20 rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-amber-500/10 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  if (!recommendations) return null;

  const urgencyColors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const strategyLabels = {
    avalanche: 'Avalanche (Highest Rate First)',
    snowball: 'Snowball (Smallest Balance First)',
    hybrid: 'Hybrid Strategy'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Main Insight Card */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-semibold text-foreground">AI Optimization</h4>
                <ModelIndicatorBadge 
                  model="deepseek-reasoner" 
                  modelName="Deepseek Reasoner"
                  queryType="mathematical_reasoning"
                />
                {recommendations.urgency_level && (
                  <Badge className={urgencyColors[recommendations.urgency_level]}>
                    {recommendations.urgency_level} priority
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {recommendations.insight_message || recommendations.key_insight}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/5 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-muted-foreground">Recommended</p>
            <p className="text-sm font-medium text-amber-400">
              {strategyLabels[recommendations.recommended_strategy]}
            </p>
          </div>
          {recommendations.interest_savings_vs_alternative != null && (
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <p className="text-xs text-muted-foreground">Interest Saved</p>
              <p className="text-sm font-medium text-emerald-400">
                ${recommendations.interest_savings_vs_alternative.toLocaleString()}
              </p>
            </div>
          )}
          {recommendations.time_savings_months != null && (
            <div className="p-2 rounded-lg bg-amber-400/10">
              <p className="text-xs text-muted-foreground">Time Saved</p>
              <p className="text-sm font-medium text-amber-400">
                {recommendations.time_savings_months} months
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Optimal Payment Allocation */}
            {recommendations.optimal_allocation && recommendations.optimal_allocation.length > 0 && (
              <Card className="p-4 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-amber-400" />
                  <h5 className="font-medium text-foreground">Optimal Payment Allocation</h5>
                </div>
                <div className="space-y-2">
                  {recommendations.optimal_allocation.map((alloc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-foreground">{alloc.debt_name}</span>
                        <span className="text-emerald-400 font-semibold">
                          +${alloc.recommended_extra_payment}/mo
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alloc.mathematical_reasoning}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Hybrid Recommendation */}
            {recommendations.hybrid_recommendation && (
              <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <h5 className="font-medium text-foreground">Hybrid Strategy</h5>
                </div>
                <p className="text-sm text-muted-foreground">{recommendations.hybrid_recommendation}</p>
              </Card>
            )}

            {/* Breakeven Analysis */}
            {recommendations.breakeven_extra_payment != null && (
              <Card className="p-4 border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <h5 className="font-medium text-foreground">Breakeven Analysis</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  At <span className="text-amber-400 font-semibold">${recommendations.breakeven_extra_payment}/month</span> extra, 
                  the strategy difference becomes significant.
                </p>
              </Card>
            )}

            {/* Psychological Score */}
            {recommendations.psychological_score != null && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-sm text-muted-foreground">Motivation Score:</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                    style={{ width: `${recommendations.psychological_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-amber-400">
                  {recommendations.psychological_score}%
                </span>
              </div>
            )}

            {/* View Reasoning Chain */}
            {reasoningChain && (
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    View AI Reasoning Chain
                  </span>
                  {showReasoning ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            )}

            <AnimatePresence>
              {showReasoning && reasoningChain && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="p-4 border-white/10 bg-stone-900/50">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                      {reasoningChain}
                    </pre>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
