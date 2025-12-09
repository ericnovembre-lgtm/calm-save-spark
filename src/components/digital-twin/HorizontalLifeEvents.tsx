import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Import and re-export the LifeEvent type from the sidebar to maintain consistency
import { LifeEvent } from './LifeEventsSidebar';
export type { LifeEvent };

const LIFE_EVENTS: LifeEvent[] = [
  { id: 'job-loss', icon: '📉', label: 'Job Loss', impact: -50000, description: 'Unemployment period', color: 'border-red-500' },
  { id: 'promotion', icon: '📈', label: 'Promotion', impact: 25000, description: 'Career advancement', color: 'border-green-500' },
  { id: 'house', icon: '🏠', label: 'Buy House', impact: -100000, description: 'Down payment & costs', color: 'border-stone-500' },
  { id: 'child', icon: '👶', label: 'Have Child', impact: -20000, description: 'Child expenses', color: 'border-pink-500' },
  { id: 'marriage', icon: '💒', label: 'Marriage', impact: -30000, description: 'Wedding costs', color: 'border-rose-500' },
  { id: 'inheritance', icon: '💰', label: 'Inheritance', impact: 150000, description: 'Unexpected windfall', color: 'border-yellow-500' },
  { id: 'medical', icon: '🏥', label: 'Medical', impact: -40000, description: 'Health emergency', color: 'border-red-500' },
  { id: 'education', icon: '🎓', label: 'Education', impact: -60000, description: 'Advanced degree', color: 'border-yellow-500' },
  { id: 'startup', icon: '🚀', label: 'Start Business', impact: -75000, description: 'Entrepreneurship', color: 'border-orange-500' },
  { id: 'car', icon: '🚗', label: 'New Car', impact: -35000, description: 'Vehicle purchase', color: 'border-amber-500' },
];

interface HorizontalLifeEventsProps {
  onEventSelect: (event: LifeEvent) => void;
  selectedEvent?: LifeEvent | null;
  className?: string;
}

export function HorizontalLifeEvents({ onEventSelect, selectedEvent, className }: HorizontalLifeEventsProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleEventTap = (event: LifeEvent) => {
    if (!prefersReducedMotion) {
      haptics.buttonPress();
      soundEffects.click();
    }
    onEventSelect(event);
  };

  return (
    <div className={cn("py-3", className)}>
      <p className="text-xs font-mono text-white/40 mb-2 px-4">TAP TO ADD EVENT</p>
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
        {LIFE_EVENTS.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          const isPositive = event.impact >= 0;
          
          return (
            <motion.button
              key={event.id}
              onClick={() => handleEventTap(event)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              className={cn(
                "flex-shrink-0 snap-start flex items-center gap-2 px-4 py-3 rounded-xl border transition-all min-w-fit",
                "backdrop-blur-sm",
                isSelected
                  ? "bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.3)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <span className="text-xl">{event.icon}</span>
              <div className="text-left">
                <div className="text-xs font-medium text-white">{event.label}</div>
                <div className={cn(
                  "text-[10px] font-mono",
                  isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {isPositive ? '+' : ''}{(event.impact / 1000).toFixed(0)}k
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
