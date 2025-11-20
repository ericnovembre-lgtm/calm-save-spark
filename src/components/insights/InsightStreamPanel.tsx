import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InsightFlashCard } from './InsightFlashCard';
import { useInsightStream } from '@/hooks/useInsightStream';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InsightStreamPanelProps {
  userId: string;
}

export function InsightStreamPanel({ userId }: InsightStreamPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  const { newInsight, clearNewInsight } = useInsightStream(userId);

  // Fetch existing unresolved insights
  const { data: insights, refetch, error: queryError } = useQuery({
    queryKey: ['proactive_insights', userId],
    queryFn: async () => {
      console.log(`[Insight Panel] Fetching insights for user ${userId}`);
      const { data, error } = await supabase
        .from('proactive_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('is_resolved', false)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('[Insight Panel] Query error:', error);
        throw error;
      }
      
      console.log(`[Insight Panel] Found ${data?.length || 0} insights`);
      return data as Array<{
        id: string;
        insight_type: string;
        severity: 'info' | 'warning' | 'urgent';
        title: string;
        message: string;
        resolution_action?: string;
        resolution_data?: Record<string, any>;
        is_resolved: boolean;
        created_at: string;
      }>;
    },
  });

  useEffect(() => {
    if (queryError) {
      console.error('[Insight Panel] Failed to load insights:', queryError);
    }
  }, [queryError]);

  // Show new insight animation
  useEffect(() => {
    if (newInsight) {
      setIsExpanded(true);
      refetch();
      
      // Auto-collapse after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        clearNewInsight();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [newInsight, clearNewInsight, refetch]);

  const handleDismiss = async (insightId: string) => {
    console.log(`[Insight Panel] Dismissing insight ${insightId}`);
    
    // Mark as dismissed in database
    const { error } = await supabase
      .from('proactive_insights')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', insightId);

    if (error) {
      console.error('[Insight Panel] Failed to dismiss insight:', error);
      toast.error('Failed to dismiss insight');
      return;
    }

    setDismissedIds(prev => new Set(prev).add(insightId));
    refetch();
  };

  const handleResolved = () => {
    refetch();
  };

  const visibleInsights = insights?.filter(i => !dismissedIds.has(i.id)) || [];

  if (visibleInsights.length === 0) return null;

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-t-2xl',
            'bg-card/80 backdrop-blur-xl border-b border-border/50',
            !isExpanded && 'rounded-b-2xl'
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium">
              Insight Stream ({visibleInsights.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>

        {/* Insights List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 p-4 bg-card/80 backdrop-blur-xl rounded-b-2xl border-x border-b border-border/50">
                <AnimatePresence mode="popLayout">
                  {visibleInsights.map((insight) => (
                    <InsightFlashCard
                      key={insight.id}
                      insight={insight}
                      onDismiss={() => handleDismiss(insight.id)}
                      onResolved={handleResolved}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
