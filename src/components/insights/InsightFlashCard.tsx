import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InsightFlashCardProps {
  insight: {
    id: string;
    insight_type: string;
    severity: 'info' | 'warning' | 'urgent';
    title: string;
    message: string;
    resolution_action?: string;
    resolution_data?: Record<string, any>;
    is_resolved: boolean;
  };
  onDismiss: () => void;
  onResolved: () => void;
}

export function InsightFlashCard({ insight, onDismiss, onResolved }: InsightFlashCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(insight.is_resolved);

  const severityConfig = {
    info: {
      icon: Info,
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      icon: AlertCircle,
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    urgent: {
      icon: AlertTriangle,
      bgGradient: 'from-red-500/10 to-rose-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600 dark:text-red-400',
    },
  };

  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  const handleFixIt = async () => {
    if (!insight.resolution_action || !insight.resolution_data) {
      toast.error('No resolution action available');
      return;
    }

    setIsResolving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call resolution handler
      const { data, error } = await supabase.functions.invoke('handle-insight-resolution', {
        body: {
          insightId: insight.id,
          actionType: insight.resolution_action,
          actionData: insight.resolution_data,
        },
      });

      if (error) throw error;

      // Mark as resolved in database
      await supabase
        .from('proactive_insights')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', insight.id);

      setIsResolved(true);
      toast.success('Issue resolved successfully!');
      
      // Notify parent
      setTimeout(() => onResolved(), 2000);

    } catch (error) {
      console.error('Resolution error:', error);
      toast.error('Failed to resolve. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleMarkViewed = async () => {
    await supabase
      .from('proactive_insights')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', insight.id);
  };

  useEffect(() => {
    handleMarkViewed();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard
        className={cn(
          'relative overflow-hidden',
          config.borderColor,
          'border-2'
        )}
        enableTilt={false}
      >
        {/* Gradient Background */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50',
            config.bgGradient
          )}
        />

        <div className="relative p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn('flex-shrink-0 p-2 rounded-full bg-background/50', config.textColor)}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1 text-foreground">{insight.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isResolved && insight.resolution_action && (
                  <Button
                    onClick={handleFixIt}
                    disabled={isResolving}
                    size="sm"
                    className="relative overflow-hidden group"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      '✨ Fix it for me'
                    )}
                  </Button>
                )}

                {isResolved && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Resolved</span>
                  </div>
                )}

                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  size="sm"
                >
                  Dismiss
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
