import HeatMap from '@uiw/react-heat-map';
import { Subscription } from '@/hooks/useSubscriptions';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BillCalendarHeatmapProps {
  subscriptions: Subscription[];
  className?: string;
}

export function BillCalendarHeatmap({ subscriptions, className = '' }: BillCalendarHeatmapProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Map subscriptions to heatmap data
  const heatmapData = daysInMonth.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const billsOnDay = subscriptions.filter(sub => {
      const nextDate = format(new Date(sub.next_expected_date), 'yyyy-MM-dd');
      return nextDate === dateStr;
    });

    const totalAmount = billsOnDay.reduce((sum, bill) => sum + Number(bill.amount), 0);

    return {
      date: dateStr,
      count: totalAmount > 0 ? Math.min(Math.ceil(totalAmount / 50), 4) : 0,
      amount: totalAmount,
      bills: billsOnDay,
    };
  });

  const highValueBills = heatmapData.filter(d => d.amount > 100);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-display">Bill Calendar</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual overview of when your bills are due this month
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider>
          <div className="relative">
            <HeatMap
              value={heatmapData}
              startDate={monthStart}
              endDate={monthEnd}
              panelColors={{
                0: 'hsl(var(--muted))',
                1: 'hsl(var(--primary) / 0.3)',
                2: 'hsl(var(--primary) / 0.5)',
                3: 'hsl(var(--primary) / 0.7)',
                4: 'hsl(var(--primary))',
              }}
              rectSize={14}
              space={4}
              rectRender={(props, data) => {
                const dayData = heatmapData.find(d => d.date === data.date);
                const isHighValue = dayData && dayData.amount > 100;

                return (
                  <Tooltip key={props.key}>
                    <TooltipTrigger asChild>
                      <g>
                        <rect
                          {...props}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        {isHighValue && (
                          <motion.circle
                            cx={Number(props.x) + 7}
                            cy={Number(props.y) + 7}
                            r="3"
                            fill="hsl(var(--primary))"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.8, 0.3, 0.8],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}
                      </g>
                    </TooltipTrigger>
                    {dayData && dayData.bills.length > 0 && (
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-semibold">{format(new Date(data.date), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            {dayData.bills.length} bill{dayData.bills.length > 1 ? 's' : ''} · ${dayData.amount.toFixed(2)}
                          </p>
                          <div className="space-y-1 mt-2">
                            {dayData.bills.map((bill, i) => (
                              <div key={i} className="text-xs">
                                {bill.merchant}: ${Number(bill.amount).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              }}
            />
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: i === 0 
                        ? 'hsl(var(--muted))'
                        : `hsl(var(--primary) / ${0.3 + (i - 1) * 0.175})`,
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
