import { useState, useEffect } from 'react';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ProcessAlertsButtonProps {
  showStats?: boolean;
  showPendingCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ProcessAlertsButton({
  showStats = true,
  showPendingCount = true,
  variant = 'outline',
  size = 'sm',
  className,
}: ProcessAlertsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastResult, setLastResult] = useState<{
    processed: number;
    latencyMs: number;
  } | null>(null);

  // Fetch pending queue count
  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from('transaction_alert_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // Subscribe to queue changes
    const channel = supabase
      .channel('queue-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_alert_queue',
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const processAlerts = async () => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('process-transaction-alerts');
      const latencyMs = Date.now() - startTime;

      if (error) {
        console.error('[ProcessAlerts] Error:', error);
        toast.error('Processing failed', {
          description: error.message || 'Failed to process alerts',
        });
        return;
      }

      const processed = data?.processed || 0;
      setLastResult({ processed, latencyMs });

      if (showStats) {
        if (processed > 0) {
          toast.success(`Processed ${processed} alert${processed > 1 ? 's' : ''}`, {
            description: `Groq analysis completed in ${latencyMs}ms`,
          });
        } else {
          toast.info('No pending alerts', {
            description: `Queue checked in ${latencyMs}ms`,
          });
        }
      }

      // Refresh pending count
      const { count } = await supabase
        .from('transaction_alert_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (count !== null) {
        setPendingCount(count);
      }
    } catch (err) {
      console.error('[ProcessAlerts] Exception:', err);
      toast.error('Processing failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={processAlerts}
      disabled={isProcessing}
      className={cn('gap-2', className)}
      aria-label="Process transaction alerts now"
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4 text-orange-400" />
      )}
      <span>Process Now</span>
      {showPendingCount && pendingCount > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-1 bg-amber-500/20 text-amber-300 text-xs"
        >
          {pendingCount}
        </Badge>
      )}
    </Button>
  );
}
