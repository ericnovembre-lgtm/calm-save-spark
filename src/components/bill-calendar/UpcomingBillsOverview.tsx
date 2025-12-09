import { BillCalendarData } from '@/hooks/useBillCalendar';
import { AlertCircle, Clock, CalendarDays, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UpcomingBillsOverviewProps {
  data: BillCalendarData;
}

export function UpcomingBillsOverview({ data }: UpcomingBillsOverviewProps) {
  const cards = [
    {
      label: 'Due This Week',
      value: `$${data.dueThisWeekTotal.toFixed(0)}`,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Total This Month',
      value: `$${data.totalDueThisMonth.toFixed(0)}`,
      icon: CalendarDays,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Overdue',
      value: data.overdueCount.toString(),
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: data.overdueCount > 0,
    },
    {
      label: 'Upcoming',
      value: data.upcomingCount.toString(),
      icon: DollarSign,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];
  
  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      data-copilot-id="bill-calendar-overview"
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "rounded-xl p-4 border",
            card.highlight 
              ? "border-destructive/50 bg-destructive/5" 
              : "border-border bg-card"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("p-1.5 rounded-lg", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </div>
          
          <p className="text-2xl font-bold text-foreground">
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {card.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
