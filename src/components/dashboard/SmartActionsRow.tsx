import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  Target, 
  AlertCircle, 
  XCircle, 
  PlusCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SmartAction {
  id: string;
  label: string;
  icon: string;
  color: 'warning' | 'destructive' | 'success' | 'default';
  savings?: number;
  action: {
    type: 'transfer' | 'navigate' | 'external';
    params?: any;
    to?: string;
  };
}

const iconMap = {
  'shield': Shield,
  'target': Target,
  'alert-circle': AlertCircle,
  'x-circle': XCircle,
  'plus-circle': PlusCircle,
};

const colorClasses = {
  warning: 'bg-warning/10 border-warning/30 hover:bg-warning/20 hover:border-warning/40 text-warning',
  destructive: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20 hover:border-destructive/40 text-destructive',
  success: 'bg-success/10 border-success/30 hover:bg-success/20 hover:border-success/40 text-success',
  default: 'bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/40 text-primary',
};

export function SmartActionsRow() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['smart-actions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-smart-actions');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Refresh every 5 minutes
    retry: 1
  });

  const executeAction = (action: SmartAction) => {
    if (action.action.type === 'navigate' && action.action.to) {
      navigate(action.action.to);
      toast({
        title: 'Action initiated',
        description: `Navigating to ${action.label.toLowerCase()}`,
      });
    } else if (action.action.type === 'transfer') {
      toast({
        title: 'Transfer ready',
        description: 'Complete the transfer on the next screen',
      });
      navigate('/savings', { state: action.action.params });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-56 rounded-xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!data?.actions || data.actions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Smart Actions
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {data.actions.map((action: SmartAction, index: number) => {
          const Icon = iconMap[action.icon as keyof typeof iconMap] || PlusCircle;
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => executeAction(action)}
                className={cn(
                  "flex items-center gap-3 px-4 py-6 h-auto whitespace-nowrap",
                  "backdrop-blur-md border transition-all group",
                  "hover:scale-105 hover:shadow-lg",
                  colorClasses[action.color]
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{action.label}</div>
                  {action.savings && (
                    <div className="text-xs opacity-70">
                      Save ${action.savings.toFixed(0)}/mo
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
