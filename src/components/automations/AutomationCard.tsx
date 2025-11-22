import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Power, PowerOff, DollarSign, Calendar, Repeat, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AutomationCardProps {
  automation: {
    id: string;
    rule_name: string;
    frequency: string;
    start_date: string;
    next_run_date?: string;
    is_active: boolean;
    action_config: {
      amount: number;
    };
    notes?: string;
  };
  onEdit: (automation: any) => void;
  onDelete: (automation: any) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export function AutomationCard({ automation, onEdit, onDelete, onToggle }: AutomationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const frequencyLabel = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
  }[automation.frequency] || automation.frequency;

  const nextDate = automation.next_run_date || automation.start_date;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn(
        "p-4 transition-all duration-200 relative glass-panel",
        automation.is_active && "shadow-lg shadow-emerald-500/20 border-emerald-500/30"
      )}>
        {/* LED Indicator */}
        <div className={cn(
          "led-indicator absolute top-4 left-4 w-2 h-2 rounded-full",
          automation.is_active ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground opacity-50"
        )} />

        <div className="flex items-center justify-between gap-4 pl-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {automation.rule_name}
              </h3>
              <Badge 
                variant={automation.is_active ? "default" : "secondary"}
                className="shrink-0"
              >
                {automation.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            
            {/* Mini Flow Preview */}
            <div className="flex items-center gap-2 mt-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-green-400" />
              </div>
              <motion.div 
                className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 max-w-[60px]"
                animate={automation.is_active ? {
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-blue-400" />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${automation.action_config.amount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {frequencyLabel}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Next: {format(new Date(nextDate), 'MMM d, yyyy')}
              </span>
            </div>
            
            {automation.notes && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                {automation.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Mechanical Toggle */}
            <button
              onClick={() => onToggle(automation.id, automation.is_active)}
              className={cn("mechanical-toggle", automation.is_active && "active")}
              aria-label={automation.is_active ? 'Pause automation' : 'Resume automation'}
            />
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(automation)}
                className="rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                aria-label="Edit automation"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </motion.div>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(automation)}
                className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Delete automation"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
