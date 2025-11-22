import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Execution {
  id: string;
  automation_rule_id: string;
  status: string | null;
  amount_transferred: number | null;
  executed_at: string | null;
  error_message: string | null;
  metadata: any;
}

export function AutomationActivityFeed() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
    subscribeToExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('automation_execution_log')
        .select('*')
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Load executions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToExecutions = () => {
    const channel = supabase
      .channel('automation-executions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'automation_execution_log'
      }, (payload) => {
        setExecutions(prev => [payload.new as Execution, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (isLoading) {
    return (
      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (executions.length === 0) {
    return (
      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No automations have run yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-panel p-6 sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {executions.map((execution) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-3 rounded-lg glass-panel-subtle border border-border/50"
            >
              <div className="flex items-start gap-3">
                {execution.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : execution.status === 'failed' ? (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {execution.metadata?.rule_name || 'Automation'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {execution.status === 'success' 
                      ? `$${execution.amount_transferred?.toFixed(2) || '0.00'} transferred`
                      : execution.error_message || 'Failed'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {execution.executed_at 
                      ? formatDistanceToNow(new Date(execution.executed_at), { addSuffix: true })
                      : 'Just now'
                    }
                  </p>
                </div>

                <Badge 
                  variant={execution.status === 'success' ? 'default' : 'destructive'}
                  className="shrink-0"
                >
                  {execution.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}
