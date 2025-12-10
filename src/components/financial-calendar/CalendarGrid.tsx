import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  RefreshCw,
  List,
  Grid3X3,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { FinancialEvent } from '@/hooks/useFinancialEvents';

interface CalendarGridProps {
  events: FinancialEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: FinancialEvent) => void;
  onAddEvent?: (date: Date) => void;
}

const eventTypeColors: Record<string, string> = {
  bill: 'bg-red-500',
  income: 'bg-green-500',
  subscription: 'bg-amber-500',
  goal_milestone: 'bg-emerald-500',
  reminder: 'bg-blue-500',
  custom: 'bg-purple-500',
};

export function CalendarGrid({ 
  events, 
  selectedDate, 
  onDateChange, 
  onEventClick,
  onAddEvent 
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), day)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(today);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onDateChange(day)}
                className={cn(
                  'relative aspect-square p-1 rounded-lg transition-colors',
                  'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary',
                  !isCurrentMonth && 'opacity-40',
                  isSelected && 'bg-primary/10 ring-2 ring-primary',
                  isTodayDate && !isSelected && 'bg-accent'
                )}
              >
                <span className={cn(
                  'text-sm',
                  isTodayDate && 'font-bold text-primary'
                )}>
                  {format(day, 'd')}
                </span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={event.id}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          eventTypeColors[event.event_type] || 'bg-primary'
                        )}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', color)} />
              <span className="text-xs text-muted-foreground capitalize">
                {type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
