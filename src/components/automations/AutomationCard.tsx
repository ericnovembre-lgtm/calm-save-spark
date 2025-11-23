import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Power, PowerOff, DollarSign, Calendar, Repeat, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDrag } from '@use-gesture/react';
import { haptics } from '@/lib/haptics';
import { useAutomationSounds } from '@/hooks/useAutomationSounds';
import { useIsMobile } from '@/hooks/useMediaQuery';

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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isMobile = useIsMobile();
  const sounds = useAutomationSounds();

  const SWIPE_THRESHOLD = 100;

  const frequencyLabel = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
  }[automation.frequency] || automation.frequency;

  const nextDate = automation.next_run_date || automation.start_date;

  const handleToggle = () => {
    haptics.toggle(!automation.is_active);
    sounds.playToggle(!automation.is_active);
    onToggle(automation.id, automation.is_active);
  };

  const handleEdit = () => {
    haptics.buttonPress();
    sounds.playBlockConnected();
    onEdit(automation);
  };

  const handleDelete = () => {
    haptics.buttonPress();
    sounds.playDelete();
    onDelete(automation);
  };

  // Swipe gesture for mobile
  const bind = useDrag(({ movement: [mx], velocity: [vx], active, cancel }) => {
    if (!isMobile) return;
    
    // Right swipe (toggle)
    if (mx > SWIPE_THRESHOLD && vx > 0.5 && !active) {
      haptics.swipe();
      sounds.playSwipe();
      handleToggle();
      cancel?.();
      setSwipeOffset(0);
      return;
    }
    
    // Left swipe (delete)
    if (mx < -SWIPE_THRESHOLD && vx > 0.5 && !active) {
      haptics.swipe();
      sounds.playSwipe();
      if (confirm('Delete this automation?')) {
        handleDelete();
      }
      cancel?.();
      setSwipeOffset(0);
      return;
    }
    
    // Update visual state during drag
    setSwipeOffset(active ? mx : 0);
  }, {
    axis: 'x',
    filterTaps: true,
  });

  return (
    <div
      {...(isMobile ? bind() : {})}
      style={{ transform: `translateX(${swipeOffset}px)`, transition: swipeOffset === 0 ? 'transform 0.2s' : 'none' }}
      className="relative"
    >
      {/* Swipe Actions Background (Mobile Only) - Enhanced */}
      {isMobile && (
        <>
          {/* Right Swipe Background (Toggle) */}
          <motion.div
            className="absolute inset-0 rounded-xl flex items-center justify-start px-8"
            style={{
              background: automation.is_active 
                ? 'linear-gradient(90deg, hsl(var(--destructive) / 0.15), transparent)' 
                : 'linear-gradient(90deg, hsl(var(--success) / 0.15), transparent)',
              opacity: Math.min(Math.abs(swipeOffset) / SWIPE_THRESHOLD, 1),
            }}
          >
            {swipeOffset > 0 && (
              <motion.div 
                animate={{ x: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                {automation.is_active ? (
                  <PowerOff className="w-7 h-7 text-destructive drop-shadow-lg" />
                ) : (
                  <Power className="w-7 h-7 text-success drop-shadow-lg" />
                )}
              </motion.div>
            )}
          </motion.div>
          
          {/* Left Swipe Background (Delete) */}
          <motion.div
            className="absolute inset-0 rounded-xl flex items-center justify-end px-8"
            style={{
              background: 'linear-gradient(270deg, hsl(var(--destructive) / 0.15), transparent)',
              opacity: Math.min(Math.abs(swipeOffset) / SWIPE_THRESHOLD, 1),
            }}
          >
            {swipeOffset < 0 && (
              <motion.div 
                animate={{ x: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Trash2 className="w-7 h-7 text-destructive drop-shadow-lg" />
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      <motion.div
        whileHover={!isMobile ? { y: -4, scale: 1.01 } : undefined}
        whileTap={!isMobile ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className={cn(
          "p-5 transition-all duration-300 relative glass-panel border-2",
          automation.is_active 
            ? "shadow-lg shadow-success/10 border-success/30 hover:shadow-xl hover:shadow-success/20" 
            : "hover:border-accent/20 hover:shadow-md"
        )}>
        {/* LED Indicator - Enhanced */}
        <motion.div 
          className={cn(
            "led-indicator absolute top-5 left-5 w-2.5 h-2.5 rounded-full",
            automation.is_active ? "bg-success shadow-lg shadow-success/50" : "bg-muted-foreground/50"
          )}
          animate={automation.is_active ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="flex items-center justify-between gap-4 pl-7">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base text-foreground truncate">
                {automation.rule_name}
              </h3>
              <Badge 
                variant={automation.is_active ? "default" : "secondary"}
                className={cn(
                  "shrink-0 font-medium",
                  automation.is_active && "bg-success hover:bg-success text-white"
                )}
              >
                {automation.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            
            {/* Mini Flow Preview - Enhanced */}
            <div className="flex items-center gap-2 mt-3 mb-4">
              <motion.div 
                className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center"
                animate={automation.is_active ? {
                  scale: [1, 1.1, 1]
                } : undefined}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                <Calendar className="w-3.5 h-3.5 text-success" />
              </motion.div>
              <motion.div 
                className="flex-1 h-0.5 bg-gradient-to-r from-success via-accent to-primary max-w-[70px] rounded-full"
                animate={automation.is_active ? {
                  opacity: [0.4, 1, 0.4]
                } : { opacity: 0.2 }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                animate={automation.is_active ? {
                  scale: [1, 1.1, 1]
                } : undefined}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-accent" />
                ${automation.action_config.amount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" />
                {frequencyLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Next: {format(new Date(nextDate), 'MMM d, yyyy')}
              </span>
            </div>
            
            {automation.notes && (
              <p className="text-xs text-muted-foreground mt-3 truncate bg-accent/5 px-2 py-1 rounded">
                {automation.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Mechanical Toggle - Enhanced */}
            <button
              onClick={handleToggle}
              className={cn(
                "mechanical-toggle transition-all duration-200",
                automation.is_active && "active"
              )}
              aria-label={automation.is_active ? 'Pause automation' : 'Resume automation'}
            />
            
            <motion.div whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                aria-label="Edit automation"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </motion.div>
            
            <motion.div whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete automation"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
        </Card>
      </motion.div>
    </div>
  );
}
