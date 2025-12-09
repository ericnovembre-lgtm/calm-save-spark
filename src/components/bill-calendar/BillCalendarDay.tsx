import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { Bill } from '@/hooks/useBillCalendar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BillCalendarDayProps {
  date: Date;
  bills: Bill[];
  isCurrentMonth: boolean;
  onClick: () => void;
}

export function BillCalendarDay({ date, bills, isCurrentMonth, onClick }: BillCalendarDayProps) {
  const today = startOfDay(new Date());
  const isCurrentDay = isToday(date);
  const isPast = isBefore(date, today) && !isCurrentDay;
  
  const hasBills = bills.length > 0;
  const hasOverdue = bills.some(b => b.status === 'overdue');
  const hasDueToday = bills.some(b => b.status === 'due_today');
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  
  // Determine indicator color
  let indicatorColor = 'bg-amber-500'; // upcoming
  if (hasOverdue) indicatorColor = 'bg-destructive';
  else if (hasDueToday) indicatorColor = 'bg-orange-500';
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={cn(
        "relative aspect-square p-1 rounded-lg transition-colors",
        "flex flex-col items-center justify-start",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCurrentMonth 
          ? "hover:bg-accent/50 cursor-pointer" 
          : "opacity-30 cursor-default",
        isCurrentDay && "bg-primary/10 ring-1 ring-primary",
        hasBills && isCurrentMonth && "bg-accent/30"
      )}
      aria-label={`${format(date, 'MMMM d')}${hasBills ? `, ${bills.length} bill${bills.length > 1 ? 's' : ''} due` : ''}`}
    >
      <span className={cn(
        "text-sm font-medium",
        isCurrentDay && "text-primary font-bold",
        isPast && isCurrentMonth && "text-muted-foreground",
        !isCurrentMonth && "text-muted-foreground/50"
      )}>
        {format(date, 'd')}
      </span>
      
      {hasBills && isCurrentMonth && (
        <div className="flex flex-col items-center gap-0.5 mt-1">
          {/* Dot indicators */}
          <div className="flex gap-0.5">
            {bills.slice(0, 3).map((_, i) => (
              <span 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  indicatorColor
                )} 
              />
            ))}
            {bills.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{bills.length - 3}</span>
            )}
          </div>
          
          {/* Amount preview (hidden on small screens) */}
          <span className="hidden md:block text-[10px] text-muted-foreground font-medium">
            ${totalAmount.toFixed(0)}
          </span>
        </div>
      )}
    </motion.button>
  );
}
