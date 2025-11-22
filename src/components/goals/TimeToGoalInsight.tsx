import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Suggestion {
  id: string;
  action: string;
  savings: number;
  timeReduction: string;
  newProjection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface TimeToGoalData {
  currentProjection: string;
  currentMonthlyContribution: string;
  remaining: string;
  suggestions: Suggestion[];
}

interface TimeToGoalInsightProps {
  goalId: string;
  userId: string;
}

/**
 * AI-powered time-to-goal calculator
 * Shows smart suggestions to accelerate goal completion
 */
export const TimeToGoalInsight = ({ goalId, userId }: TimeToGoalInsightProps) => {
  const [data, setData] = useState<TimeToGoalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enabledSuggestions, setEnabledSuggestions] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadInsights();
  }, [goalId, userId]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('calculate-time-to-goal', {
        body: { goalId, userId }
      });

      if (error) throw error;
      setData(result);
    } catch (error) {
      console.error('Failed to load time-to-goal insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setEnabledSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getOptimizedProjection = (): Date => {
    if (!data) return new Date();
    
    let projection = new Date(data.currentProjection);
    
    data.suggestions
      .filter(s => enabledSuggestions.has(s.id))
      .forEach(s => {
        projection = new Date(s.newProjection);
      });
    
    return projection;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!data || data.suggestions.length === 0) {
    return null;
  }

  const optimizedDate = getOptimizedProjection();
  const originalDate = new Date(data.currentProjection);
  const daysSaved = Math.round((originalDate.getTime() - optimizedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      className="space-y-4 p-4 rounded-xl border border-border bg-card/50 backdrop-blur"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Reach Your Goal Faster</h3>
      </div>

      {/* Current Projection */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Current projection:</span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {originalDate.toLocaleDateString()}
        </span>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {data.suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all',
                enabledSuggestions.has(suggestion.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card'
              )}
              onClick={() => toggleSuggestion(suggestion.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {suggestion.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Save ${suggestion.savings}/month</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">
                      {suggestion.timeReduction} faster
                    </span>
                    <span>•</span>
                    <span className={cn('px-2 py-0.5 rounded-full', getDifficultyColor(suggestion.difficulty))}>
                      {suggestion.difficulty}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledSuggestions.has(suggestion.id)}
                  onChange={() => toggleSuggestion(suggestion.id)}
                  className="w-5 h-5 rounded border-2 border-border checked:bg-primary checked:border-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Optimized Projection */}
      {enabledSuggestions.size > 0 && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                New projection with {enabledSuggestions.size} change{enabledSuggestions.size > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Reach your goal <span className="font-bold text-primary">{daysSaved} days</span> sooner!
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {optimizedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {optimizedDate.getFullYear()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
