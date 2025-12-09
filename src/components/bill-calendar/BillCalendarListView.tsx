import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { Bill } from '@/hooks/useBillCalendar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface BillCalendarListViewProps {
  bills: Bill[];
  onBillClick: (bill: Bill) => void;
}

export function BillCalendarListView({ bills, onBillClick }: BillCalendarListViewProps) {
  const sortedBills = [...bills].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  const groupedBills = sortedBills.reduce((groups, bill) => {
    const dateKey = format(bill.dueDate, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(bill);
    return groups;
  }, {} as Record<string, Bill[]>);
  
  const getStatusIcon = (status: Bill['status']) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'due_today':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'overdue':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Overdue</span>;
      case 'due_today':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600">Due Today</span>;
      case 'paid':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Paid</span>;
      default:
        return null;
    }
  };
  
  if (bills.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No bills this month</h3>
        <p className="text-sm text-muted-foreground">
          Your detected subscriptions will appear here when due.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden" data-copilot-id="bill-calendar-list">
      {Object.entries(groupedBills).map(([dateKey, dateBills], groupIndex) => {
        const date = new Date(dateKey);
        const isCurrentDay = isToday(date);
        const isPast = isBefore(date, startOfDay(new Date())) && !isCurrentDay;
        
        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className={cn(
              "px-4 py-2 border-b border-border",
              isCurrentDay ? "bg-primary/5" : "bg-muted/30"
            )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay && "text-primary"
                )}>
                  {isCurrentDay ? 'Today' : format(date, 'EEEE, MMMM d')}
                </span>
                {isPast && (
                  <span className="text-xs text-destructive">Past due</span>
                )}
              </div>
            </div>
            
            {/* Bills for this date */}
            {dateBills.map((bill, i) => (
              <motion.button
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onBillClick(bill)}
                className={cn(
                  "w-full flex items-center justify-between p-4",
                  "hover:bg-accent/50 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  i < dateBills.length - 1 && "border-b border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(bill.status)}
                  <div className="text-left">
                    <p className="font-medium text-foreground">{bill.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {bill.category || 'Subscription'} • {bill.frequency || 'Monthly'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(bill.status)}
                  <span className="font-semibold text-foreground">
                    ${bill.amount.toFixed(2)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
