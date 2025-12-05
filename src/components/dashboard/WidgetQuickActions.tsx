import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getWidgetActions, type WidgetAction } from '@/lib/widget-actions-config';
import { useWidgetAnalytics } from '@/hooks/useWidgetAnalytics';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface WidgetQuickActionsProps {
  widgetId: string;
  className?: string;
  onModalOpen?: (modalId: string) => void;
}

export function WidgetQuickActions({ 
  widgetId, 
  className,
  onModalOpen 
}: WidgetQuickActionsProps) {
  const navigate = useNavigate();
  const { trackAction } = useWidgetAnalytics();
  const prefersReducedMotion = useReducedMotion();
  
  const actions = getWidgetActions(widgetId);
  
  if (actions.length === 0) return null;

  const handleAction = (action: WidgetAction) => {
    trackAction(widgetId, action.id);
    
    if (action.route) {
      navigate(action.route);
    } else if (action.modal && onModalOpen) {
      onModalOpen(action.modal);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex items-center gap-1",
        className
      )}
    >
      {actions.map((action) => (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant === 'primary' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md",
                action.variant === 'primary' 
                  ? "bg-primary/90 hover:bg-primary text-primary-foreground"
                  : "bg-background/80 hover:bg-accent/80 backdrop-blur-sm"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action);
              }}
            >
              <action.icon className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {action.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </motion.div>
  );
}
