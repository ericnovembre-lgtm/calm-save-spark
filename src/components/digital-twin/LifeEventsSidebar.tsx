import { motion } from 'framer-motion';
import { Home, Baby, Briefcase, TrendingDown, Car, Heart, Plane, Zap, Gift, Activity } from 'lucide-react';
import { useState } from 'react';

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
  { id: 'vacation', icon: '✈️', label: 'World Trip', impact: -15000, description: '$15K travel', color: 'border-cyan-500' },
  { id: 'layoff', icon: '⚡', label: 'Layoff', impact: -40000, description: '6 months no income', color: 'border-orange-500' },
  { id: 'inheritance', icon: '🎁', label: 'Inheritance', impact: 200000, description: '$200K windfall', color: 'border-yellow-500' },
  { id: 'medical', icon: '🏥', label: 'Medical Emergency', impact: -25000, description: '$25K expenses', color: 'border-red-500' },
];

interface LifeEventsSidebarProps {
  onEventSelect: (event: LifeEvent) => void;
}

export function LifeEventsSidebar({ onEventSelect }: LifeEventsSidebarProps) {
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  return (
    <motion.div
      className="fixed left-0 top-1/2 -translate-y-1/2 w-72 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent z-40"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    >
      <div className="backdrop-blur-xl bg-card/80 border border-border rounded-r-2xl p-4">
        <h3 className="text-sm font-mono text-muted-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          LIFE EVENTS
        </h3>
        
        <div className="space-y-2">
          {lifeEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              className={`p-3 rounded-lg border-2 ${event.color} bg-muted/40 backdrop-blur cursor-move hover:scale-105 transition-transform`}
              draggable
              onDragStart={() => {
                setDraggedEvent(event.id);
                onEventSelect(event);
              }}
              onDragEnd={() => setDraggedEvent(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
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
          ))}
        </div>

        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-muted-foreground">
          💡 Drag events onto the timeline to see their impact
        </div>
      </div>
    </motion.div>
  );
}
