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
          "p-6 transition-all duration-300 relative glass-panel border-2",
          automation.is_active 
            ? "border-success/30" 
            : "border-border"
        )}>
        {/* LED Indicator - Refined */}
        <motion.div 
          className={cn(
            "absolute top-6 left-6 w-3 h-3 rounded-full",
            automation.is_active ? "bg-success" : "bg-muted-foreground/40"
          )}
          animate={automation.is_active ? {
            scale: [1, 1.15, 1],
            opacity: [1, 0.7, 1]
          } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex items-center justify-between gap-6 pl-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {automation.rule_name}
              </h3>
              <Badge 
                variant={automation.is_active ? "default" : "secondary"}
                className={cn(
                  "shrink-0",
                  automation.is_active && "bg-success hover:bg-success text-white"
                )}
              >
                {automation.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            
            {/* Mini Flow Preview - Refined */}
            <div className="flex items-center gap-3 mt-4 mb-5">
              <motion.div 
                className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center"
                animate={automation.is_active ? {
                  scale: [1, 1.05, 1]
                } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Calendar className="w-4 h-4 text-success" />
              </motion.div>
              <motion.div 
                className="flex-1 h-0.5 bg-gradient-to-r from-success via-accent to-primary max-w-[80px] rounded-full"
                animate={automation.is_active ? {
                  opacity: [0.3, 1, 0.3]
                } : { opacity: 0.15 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"
                animate={automation.is_active ? {
                  scale: [1, 1.05, 1]
                } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.25 }}
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 font-medium">
                <DollarSign className="w-4 h-4 text-accent" />
                ${automation.action_config.amount.toLocaleString()}
              </span>
              <span className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                {frequencyLabel}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(nextDate), 'MMM d, yyyy')}
              </span>
            </div>
            
            {automation.notes && (
              <p className="text-sm text-muted-foreground mt-4 truncate bg-muted/30 px-3 py-2 rounded-lg">
                {automation.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Toggle Switch - Refined */}
            <button
              onClick={handleToggle}
              className={cn(
                "mechanical-toggle",
                automation.is_active && "active"
              )}
              aria-label={automation.is_active ? 'Pause automation' : 'Resume automation'}
            />
            
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground"
                aria-label="Edit automation"
              >
                <Edit2 className="w-4.5 h-4.5" />
              </Button>
            </motion.div>
            
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive"
                aria-label="Delete automation"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </Button>
            </motion.div>
          </div>
        </div>
        </Card>
      </motion.div>
    </div>
  );
}
