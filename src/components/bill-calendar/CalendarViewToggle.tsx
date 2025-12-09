import { Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarView = 'calendar' | 'list';

interface CalendarViewToggleProps {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
}

export function CalendarViewToggle({ view, onChange }: CalendarViewToggleProps) {
  return (
    <div 
      className="inline-flex rounded-lg border border-border p-1 bg-muted/30"
      role="tablist"
      aria-label="Calendar view"
    >
      <Button
        variant="ghost"
        size="sm"
        role="tab"
        aria-selected={view === 'calendar'}
        onClick={() => onChange('calendar')}
        className={cn(
          "h-8 px-3 rounded-md transition-colors",
          view === 'calendar' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Calendar
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        role="tab"
        aria-selected={view === 'list'}
        onClick={() => onChange('list')}
        className={cn(
          "h-8 px-3 rounded-md transition-colors",
          view === 'list' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-4 w-4 mr-2" />
        List
      </Button>
    </div>
  );
}
