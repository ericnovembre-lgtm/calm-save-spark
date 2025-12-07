import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface LifeEvent {
  id: string;
  icon: string;
  label: string;
  impact: number;
  description: string;
  color: string;
}

const lifeEvents: LifeEvent[] = [
  { id: 'house', icon: '🏠', label: 'Buy House', impact: -300000, description: '$300K mortgage', color: 'border-blue-500' },
  { id: 'kids', icon: '👶', label: 'Have Kids', impact: -200000, description: '$200K over 18 years', color: 'border-pink-500' },
  { id: 'job', icon: '💼', label: 'New Job +30%', impact: 50000, description: 'Salary increase', color: 'border-green-500' },
  { id: 'crash', icon: '📉', label: 'Market Crash', impact: -100000, description: '-40% portfolio value', color: 'border-red-500' },
  { id: 'tesla', icon: '🚗', label: 'Buy Tesla', impact: -50000, description: '$50K vehicle', color: 'border-purple-500' },
  { id: 'marriage', icon: '💍', label: 'Get Married', impact: -30000, description: '$30K wedding', color: 'border-rose-500' },
  { id: 'vacation', icon: '✈️', label: 'World Trip', impact: -15000, description: '$15K travel', color: 'border-amber-500' },
  { id: 'layoff', icon: '⚡', label: 'Layoff', impact: -40000, description: '6 months no income', color: 'border-orange-500' },
  { id: 'inheritance', icon: '🎁', label: 'Inheritance', impact: 200000, description: '$200K windfall', color: 'border-yellow-500' },
  { id: 'medical', icon: '🏥', label: 'Medical Emergency', impact: -25000, description: '$25K expenses', color: 'border-red-500' },
];

interface LifeEventsSidebarProps {
  onEventSelect: (event: LifeEvent) => void;
}

export function LifeEventsSidebar({ onEventSelect }: LifeEventsSidebarProps) {
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const lastHoverFeedbackTime = useRef<number>(0);
  const HOVER_FEEDBACK_DELAY = 300;

  const isExpanded = !isCollapsed || isHovering;

  // Haptic + sound feedback handlers
  const playExpandFeedback = useCallback(() => {
    if (prefersReducedMotion) return;
    haptics.swipe();
    soundEffects.swipe();
  }, [prefersReducedMotion]);

  const playCollapseFeedback = useCallback(() => {
    if (prefersReducedMotion) return;
    haptics.vibrate('light');
    soundEffects.click();
  }, [prefersReducedMotion]);

  const playToggleFeedback = useCallback(() => {
    if (prefersReducedMotion) return;
    haptics.buttonPress();
    soundEffects.click();
  }, [prefersReducedMotion]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    const now = Date.now();
    if (isCollapsed && now - lastHoverFeedbackTime.current > HOVER_FEEDBACK_DELAY) {
      playExpandFeedback();
      lastHoverFeedbackTime.current = now;
    }
  }, [isCollapsed, playExpandFeedback]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const now = Date.now();
    if (isCollapsed && now - lastHoverFeedbackTime.current > HOVER_FEEDBACK_DELAY) {
      playCollapseFeedback();
      lastHoverFeedbackTime.current = now;
    }
  }, [isCollapsed, playCollapseFeedback]);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent z-40"
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isExpanded ? 288 : 64,
        }}
        transition={{ 
          x: { delay: 0.5, type: 'spring' },
          opacity: { delay: 0.5 },
          width: { type: 'spring', stiffness: 300, damping: 30 }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="backdrop-blur-xl bg-card/80 border border-border rounded-r-2xl p-3">
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.h3
                  key="full-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-mono text-muted-foreground flex items-center gap-2"
                >
                  <Zap className="w-3 h-3" />
                  LIFE EVENTS
                </motion.h3>
              ) : (
                <motion.div
                  key="icon-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                playToggleFeedback();
              }}
              className="p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={isCollapsed ? "Pin sidebar open" : "Allow sidebar to collapse"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="space-y-2">
            {lifeEvents.map((event, idx) => (
              <AnimatePresence key={event.id} mode="wait">
                {isExpanded ? (
                  /* Expanded: Full card */
                  <motion.div
                    key={`${event.id}-full`}
                    className={`p-3 rounded-lg border-2 ${event.color} bg-muted/40 backdrop-blur cursor-move hover:scale-105 transition-transform relative`}
                    draggable
                    onDragStart={() => {
                      setDraggedEvent(event.id);
                      onEventSelect(event);
                    }}
                    onDragEnd={() => setDraggedEvent(null)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ x: 10 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{event.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{event.description}</div>
                        <div className={`text-xs font-mono mt-1 ${event.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {event.impact >= 0 ? '+' : ''}{(event.impact / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>

                    {draggedEvent === event.id && (
                      <motion.div
                        className="absolute inset-0 bg-accent/20 rounded-lg pointer-events-none"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ) : (
                  /* Collapsed: Icon only with tooltip */
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        key={`${event.id}-icon`}
                        className={`p-2 rounded-lg border-2 ${event.color} bg-muted/40 backdrop-blur cursor-move hover:scale-110 transition-transform flex items-center justify-center`}
                        draggable
                        onDragStart={() => {
                          setDraggedEvent(event.id);
                          onEventSelect(event);
                        }}
                        onDragEnd={() => setDraggedEvent(null)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <span className="text-xl">{event.icon}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover border-border">
                      <div className="text-sm font-medium">{event.label}</div>
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                      <div className={`text-xs font-mono ${event.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {event.impact >= 0 ? '+' : ''}{(event.impact / 1000).toFixed(0)}K
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Hint - only when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded-lg text-xs text-muted-foreground"
              >
                💡 Drag events onto the timeline
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
