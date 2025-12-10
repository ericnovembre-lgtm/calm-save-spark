import { motion } from 'framer-motion';
import { format, isSameDay, isToday, isTomorrow, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { FinancialEvent } from '@/hooks/useFinancialEvents';
import { 
  CalendarDays, 
  DollarSign, 
  Target, 
  CreditCard, 
  Bell,
  Repeat
} from 'lucide-react';

interface CalendarAgendaViewProps {
  events: FinancialEvent[];
  onEventClick?: (event: FinancialEvent) => void;
  onToggleComplete?: (eventId: string, isCompleted: boolean) => void;
}

const eventTypeIcons: Record<string, React.ElementType> = {
  bill: CreditCard,
  income: DollarSign,
  subscription: Repeat,
  goal_milestone: Target,
  reminder: Bell,
  custom: CalendarDays,
};

export function CalendarAgendaView({ 
  events, 
  onEventClick, 
  onToggleComplete 
}: CalendarAgendaViewProps) {
  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = event.event_date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, FinancialEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No upcoming events</p>
          <p className="text-sm text-muted-foreground">
            Add events or sync from your subscriptions and goals
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr, dateIndex) => {
        const dayEvents = groupedEvents[dateStr];
        const date = new Date(dateStr);
        const isPast = date < new Date() && !isToday(date);

        return (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-12 h-12 rounded-lg flex flex-col items-center justify-center',
                isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <span className="text-xs font-medium">{format(date, 'MMM')}</span>
                <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
              </div>
              <div>
                <h3 className={cn(
                  'font-semibold',
                  isPast && 'text-muted-foreground'
                )}>
                  {getDateLabel(dateStr)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2 ml-15 pl-4 border-l-2 border-muted">
              {dayEvents.map((event, eventIndex) => {
                const Icon = eventTypeIcons[event.event_type] || CalendarDays;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dateIndex * 0.1 + eventIndex * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        event.is_completed && 'opacity-60'
                      )}
                      onClick={() => onEventClick?.(event)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {onToggleComplete && (
                            <Checkbox
                              checked={event.is_completed}
                              onCheckedChange={(checked) => {
                                onToggleComplete(event.id, !!checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                            />
                          )}
                          
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${event.color}20` }}
                          >
                            <Icon 
                              className="w-4 h-4" 
                              style={{ color: event.color }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                'font-medium text-sm',
                                event.is_completed && 'line-through'
                              )}>
                                {event.title}
                              </p>
                              {event.amount && (
                                <span className={cn(
                                  'font-semibold text-sm whitespace-nowrap',
                                  event.event_type === 'income' 
                                    ? 'text-green-500' 
                                    : 'text-foreground'
                                )}>
                                  {event.event_type === 'income' ? '+' : '-'}
                                  ${Math.abs(event.amount).toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {event.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {event.event_type.replace('_', ' ')}
                              </Badge>
                              {event.recurrence_rule && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="w-3 h-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
