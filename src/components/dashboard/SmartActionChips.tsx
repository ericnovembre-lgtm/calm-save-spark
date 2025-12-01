import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  TrendingUp, 
  PiggyBank, 
  AlertCircle,
  Zap,
  Target,
  Shield,
  CreditCard,
  DollarSign,
  PlusCircle,
  XCircle
} from 'lucide-react';
import { WidgetPriority } from '@/hooks/useGenerativeLayoutEngine';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartActionChipsProps {
  priorities: WidgetPriority[];
  onAction: (actionId: string) => void;
}

interface AIOpportunity {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: 'success' | 'warning' | 'destructive' | 'default';
  savings?: number;
  urgency: 'high' | 'medium' | 'low';
  action: {
    type: 'navigate' | 'transfer' | 'external';
    to?: string;
    params?: Record<string, any>;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp className="w-4 h-4" />,
  'trending-down': <TrendingUp className="w-4 h-4 rotate-180" />,
  'shield': <Shield className="w-4 h-4" />,
  'target': <Target className="w-4 h-4" />,
  'alert-circle': <AlertCircle className="w-4 h-4" />,
  'zap': <Zap className="w-4 h-4" />,
  'piggy-bank': <PiggyBank className="w-4 h-4" />,
  'credit-card': <CreditCard className="w-4 h-4" />,
  'dollar-sign': <DollarSign className="w-4 h-4" />,
  'arrow-right': <ArrowRight className="w-4 h-4" />,
  'plus-circle': <PlusCircle className="w-4 h-4" />,
  'x-circle': <XCircle className="w-4 h-4" />,
};

const colorToVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  'success': 'default',
  'warning': 'secondary',
  'destructive': 'destructive',
  'default': 'outline'
};

/**
 * Smart Action Chips
 * AI-powered opportunity scanner using Gemini
 */
export function SmartActionChips({ priorities, onAction }: SmartActionChipsProps) {
  // Fetch AI-generated opportunities
  const { data: opportunitiesData, isLoading, isError } = useQuery({
    queryKey: ['ai-opportunity-scanner'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-ai-opportunity-scanner', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  const actions: AIOpportunity[] = opportunitiesData?.actions || [];
  
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-48 rounded-xl" />
        ))}
      </motion.div>
    );
  }

  // Show nothing if error or no actions
  if (isError || actions.length === 0) return null;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {actions.map((action, index) => {
          const icon = iconMap[action.icon] || <Zap className="w-4 h-4" />;
          const variant = colorToVariant[action.color] || 'outline';

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.3 + (index * 0.1),
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={variant}
                    size="lg"
                    onClick={() => onAction(action.id)}
                    className="group relative overflow-hidden border-glass-border bg-glass backdrop-blur-glass shadow-glass hover:shadow-glass-strong transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {icon}
                      {action.label}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    
                    {/* Urgency indicator */}
                    {action.urgency === 'high' && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{action.description}</p>
                  {action.savings && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Potential savings: ${action.savings.toFixed(0)}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </motion.div>
    </TooltipProvider>
  );
}
