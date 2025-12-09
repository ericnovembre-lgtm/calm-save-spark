import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';
import { IncomeEntry, IncomeFrequency } from '@/hooks/useIncomeEntries';
import { format, addDays, addWeeks, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface IncomeCalendarProps {
  entries: IncomeEntry[];
}

interface ScheduledPayment {
  date: Date;
  entry: IncomeEntry;
}

function getNextPaymentDates(entry: IncomeEntry, startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const entryStart = new Date(entry.start_date);
  let current = entryStart > startDate ? entryStart : startDate;

  const frequencyMap: Record<IncomeFrequency, (date: Date) => Date> = {
    one_time: () => entryStart,
    weekly: (d) => addWeeks(d, 1),
    bi_weekly: (d) => addWeeks(d, 2),
    monthly: (d) => addMonths(d, 1),
    quarterly: (d) => addMonths(d, 3),
    annually: (d) => addMonths(d, 12),
  };

  if (entry.frequency === 'one_time') {
    if (entryStart >= startDate && entryStart <= endDate) {
      dates.push(entryStart);
    }
    return dates;
  }

  // Find first payment date in range
  let paymentDate = entryStart;
  while (paymentDate < startDate) {
    paymentDate = frequencyMap[entry.frequency](paymentDate);
  }

  // Collect all payment dates in range
  while (paymentDate <= endDate) {
    dates.push(new Date(paymentDate));
    paymentDate = frequencyMap[entry.frequency](paymentDate);
  }

  return dates;
}

export function IncomeCalendar({ entries }: IncomeCalendarProps) {
  const activeEntries = entries.filter(e => e.is_active);

  const { scheduledPayments, currentMonthDays } = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const payments: ScheduledPayment[] = [];

    activeEntries.forEach(entry => {
      const dates = getNextPaymentDates(entry, monthStart, monthEnd);
      dates.forEach(date => {
        payments.push({ date, entry });
      });
    });

    return {
      scheduledPayments: payments,
      currentMonthDays: days,
    };
  }, [activeEntries]);

  const getPaymentsForDay = (day: Date) => {
    return scheduledPayments.filter(p => isSameDay(p.date, day));
  };

  const upcomingPayments = scheduledPayments
    .filter(p => p.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (activeEntries.length === 0) {
    return null;
  }

  return (
    <Card data-copilot-id="income-calendar">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Payment Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upcoming Payments List */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Upcoming Payments</p>
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments scheduled this month</p>
          ) : (
            <div className="space-y-2">
              {upcomingPayments.map((payment, index) => (
                <div 
                  key={`${payment.entry.id}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payment.entry.source_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(payment.date, 'EEEE, MMM d')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    ${payment.entry.amount.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini Calendar Grid */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {format(new Date(), 'MMMM yyyy')}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
            {/* Empty cells for days before month starts */}
            {Array.from({ length: currentMonthDays[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {currentMonthDays.map(day => {
              const payments = getPaymentsForDay(day);
              const hasPayment = payments.length > 0;
              const isToday = isSameDay(day, new Date());
              const totalAmount = payments.reduce((sum, p) => sum + p.entry.amount, 0);

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative
                    ${isToday ? 'bg-primary text-primary-foreground' : ''}
                    ${hasPayment && !isToday ? 'bg-amber-500/10' : ''}
                  `}
                  title={hasPayment ? `$${totalAmount.toLocaleString()}` : undefined}
                >
                  {format(day, 'd')}
                  {hasPayment && (
                    <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
