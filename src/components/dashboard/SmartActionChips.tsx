import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  TrendingUp, 
  PiggyBank, 
  AlertCircle,
  Zap,
  Target
} from 'lucide-react';
import { WidgetPriority } from '@/hooks/useGenerativeLayoutEngine';

interface SmartActionChipsProps {
  priorities: WidgetPriority[];
  onAction: (actionId: string) => void;
}

interface SmartAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  priority: number;
}

/**
 * Smart Action Chips
 * Dynamically appear based on widget priority scores
 */
export function SmartActionChips({ priorities, onAction }: SmartActionChipsProps) {
  const generateActions = (): SmartAction[] => {
    const actions: SmartAction[] = [];
    
    priorities.forEach(widget => {
      // High priority balance (low funds)
      if (widget.id === 'balance' && widget.score > 90) {
        actions.push({
          id: 'setup-autosave',
          label: 'Set Up Auto-Save',
          icon: <PiggyBank className="w-4 h-4" />,
          variant: 'default',
          priority: widget.score
        });
      }
      
      // Near-complete goals
      if (widget.id === 'goals' && widget.score > 85) {
        actions.push({
          id: 'complete-goal',
          label: 'Finish Your Goal',
          icon: <Target className="w-4 h-4" />,
          variant: 'default',
          priority: widget.score
        });
      }
      
      // Significant portfolio movement
      if (widget.id === 'portfolio' && widget.score > 85) {
        actions.push({
          id: 'review-portfolio',
          label: 'Review Portfolio',
          icon: <TrendingUp className="w-4 h-4" />,
          variant: 'secondary',
          priority: widget.score
        });
      }
      
      // Budget exceeded
      if (widget.id === 'budgets' && widget.score > 80) {
        actions.push({
          id: 'review-budget',
          label: 'Check Budget',
          icon: <AlertCircle className="w-4 h-4" />,
          variant: 'destructive',
          priority: widget.score
        });
      }
      
      // High balance (opportunity to invest)
      if (widget.id === 'balance' && widget.score > 70 && widget.score < 85) {
        actions.push({
          id: 'move-to-savings',
          label: 'Move to High-Yield',
          icon: <Zap className="w-4 h-4" />,
          variant: 'secondary',
          priority: widget.score
        });
      }
    });
    
    // Sort by priority and limit to top 4
    return actions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4);
  };

  const actions = generateActions();
  
  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-wrap gap-3"
    >
      {actions.map((action, index) => (
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
          <Button
            variant={action.variant}
            size="lg"
            onClick={() => onAction(action.id)}
            className="group relative overflow-hidden border-glass-border bg-glass backdrop-blur-glass shadow-glass hover:shadow-glass-strong transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              {action.icon}
              {action.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
            
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
