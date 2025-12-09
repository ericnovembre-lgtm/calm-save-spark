import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from "lucide-react";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";

interface RecurringCalendarViewProps {
  transactions: RecurringTransaction[];
  isLoading: boolean;
}

export function RecurringCalendarView({ transactions, isLoading }: RecurringCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const transactionsByDay: Record<number, RecurringTransaction[]> = {};
    
    transactions.forEach(tx => {
      if (tx.expected_date) {
        if (!transactionsByDay[tx.expected_date]) {
          transactionsByDay[tx.expected_date] = [];
        }
        transactionsByDay[tx.expected_date].push(tx);
      }
    });

    return { days, transactionsByDay };
  }, [currentMonth, transactions]);

  const monthlyTotal = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      let monthlyAmount = tx.avg_amount;
      if (tx.frequency === 'weekly') monthlyAmount *= 4.33;
      else if (tx.frequency === 'biweekly') monthlyAmount *= 2.17;
      else if (tx.frequency === 'yearly') monthlyAmount /= 12;
      else if (tx.frequency === 'quarterly') monthlyAmount /= 3;
      return sum + Math.abs(monthlyAmount);
    }, 0);
  }, [transactions]);

  const getDayTotal = (day: number) => {
    const dayTx = calendarData.transactionsByDay[day] || [];
    return dayTx.reduce((sum, tx) => sum + Math.abs(tx.avg_amount), 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Payment Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month Summary */}
        <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Expected This Month</p>
            <p className="text-2xl font-bold text-foreground">
              ${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Payments</p>
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: calendarData.days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Calendar Days */}
          {calendarData.days.map((day) => {
            const dayNum = day.getDate();
            const dayTransactions = calendarData.transactionsByDay[dayNum] || [];
            const dayTotal = getDayTotal(dayNum);
            const hasTransactions = dayTransactions.length > 0;
            const isPast = day < new Date() && !isToday(day);
            
            return (
              <motion.div
                key={dayNum}
                className={`
                  aspect-square p-1 rounded-lg border transition-colors relative
                  ${isToday(day) ? 'border-amber-500 bg-amber-500/10' : 'border-transparent'}
                  ${hasTransactions ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent/30'}
                  ${isPast ? 'opacity-50' : ''}
                `}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xs font-medium text-foreground">{dayNum}</div>
                {hasTransactions && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="flex items-center justify-center gap-0.5">
                      {dayTransactions.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      ))}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-0.5">
                      ${dayTotal.toFixed(0)}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming List */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">Upcoming This Month</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(calendarData.transactionsByDay)
              .filter(([day]) => parseInt(day) >= new Date().getDate())
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([day, txList]) => (
                <div key={day} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <span className="font-bold text-amber-600">{day}</span>
                    </div>
                    <div>
                      {txList.map(tx => (
                        <p key={tx.id} className="text-sm font-medium">{tx.merchant}</p>
                      ))}
                    </div>
                  </div>
                  <p className="font-semibold tabular-nums">
                    ${txList.reduce((sum, tx) => sum + Math.abs(tx.avg_amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            {Object.entries(calendarData.transactionsByDay).filter(([day]) => parseInt(day) >= new Date().getDate()).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No upcoming payments this month</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
