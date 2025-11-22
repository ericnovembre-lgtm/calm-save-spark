import HeatMap from '@uiw/react-heat-map';
import { Subscription } from '@/hooks/useSubscriptions';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { MerchantLogo } from './MerchantLogo';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BillCalendarHeatmapProps {
  subscriptions: Subscription[];
  className?: string;
  onMarkForCancellation?: (id: string) => void;
}

export function BillCalendarHeatmap({ subscriptions, className = '', onMarkForCancellation }: BillCalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'due' | 'zombie'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Map subscriptions to heatmap data with filtering
  const heatmapData = daysInMonth.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let billsOnDay = subscriptions.filter(sub => {
      const nextDate = format(new Date(sub.next_expected_date), 'yyyy-MM-dd');
      return nextDate === dateStr;
    });

    // Apply filters
    if (filter === 'high') {
      billsOnDay = billsOnDay.filter(b => Number(b.amount) > 100);
    } else if (filter === 'zombie') {
      billsOnDay = billsOnDay.filter(b => b.zombie_score && b.zombie_score > 50);
    } else if (filter === 'due') {
      const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0 || daysUntil > 7) billsOnDay = [];
    }

    const totalAmount = billsOnDay.reduce((sum, bill) => sum + Number(bill.amount), 0);

    return {
      date: dateStr,
      count: totalAmount > 0 ? Math.min(Math.ceil(totalAmount / 50), 4) : 0,
      amount: totalAmount,
      bills: billsOnDay,
    };
  });

  const selectedDayData = selectedDate ? heatmapData.find(d => d.date === selectedDate) : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedDate) return;
      
      const currentIndex = heatmapData.findIndex(d => d.date === selectedDate);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = Math.min(heatmapData.length - 1, currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 7);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = Math.min(heatmapData.length - 1, currentIndex + 7);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedDate(null);
        return;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        return;
      }

      if (newIndex !== currentIndex) {
        setSelectedDate(heatmapData[newIndex].date);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, heatmapData]);

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-display">Bill Calendar</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Click any date to see bills and take quick actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentMonth(new Date())}
              className="min-w-[140px] font-semibold"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(currentMonth, 'MMMM yyyy')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {[
            { value: 'all' as const, label: 'All Bills' },
            { value: 'high' as const, label: 'High Value' },
            { value: 'due' as const, label: 'Due Soon' },
            { value: 'zombie' as const, label: 'Zombies' },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className={cn("lg:col-span-2", selectedDate && "lg:col-span-2")}>
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
                  rectSize={32}
                  space={6}
                  rectRender={(props, data) => {
                    const dayData = heatmapData.find(d => d.date === data.date);
                    const isHighValue = dayData && dayData.amount > 100;
                    const isSelected = selectedDate === data.date;
                    const isToday = isSameDay(new Date(data.date), new Date());

                    return (
                      <Tooltip key={props.key}>
                        <TooltipTrigger asChild>
                          <g
                            onClick={() => setSelectedDate(data.date)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedDate(data.date);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`${format(new Date(data.date), 'MMMM d')}, ${dayData?.bills.length || 0} bills, $${dayData?.amount.toFixed(2) || '0.00'}`}
                          >
                            <rect
                              {...props}
                              className={cn(
                                "cursor-pointer transition-all duration-200",
                                "hover:opacity-80 hover:scale-110 active:scale-95",
                                isSelected && "ring-2 ring-primary ring-offset-2"
                              )}
                              stroke={isSelected ? 'hsl(var(--primary))' : isToday ? 'hsl(var(--foreground))' : 'none'}
                              strokeWidth={isSelected ? 3 : isToday ? 2 : 0}
                              rx={4}
                            />
                            {isHighValue && (
                              <motion.circle
                                cx={Number(props.x) + 16}
                                cy={Number(props.y) + 16}
                                r="4"
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
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold">{format(new Date(data.date), 'MMM d, yyyy')}</p>
                              <p className="text-sm text-muted-foreground">
                                {dayData.bills.length} bill{dayData.bills.length > 1 ? 's' : ''} · ${dayData.amount.toFixed(2)}
                              </p>
                              <div className="space-y-1 mt-2">
                                {dayData.bills.slice(0, 3).map((bill, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <MerchantLogo merchant={bill.merchant} size="sm" />
                                    <span className="flex-1 truncate">{bill.merchant}</span>
                                    <span className="font-medium">${Number(bill.amount).toFixed(2)}</span>
                                  </div>
                                ))}
                                {dayData.bills.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{dayData.bills.length - 3} more
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Click to view details
                              </p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  }}
                />
                <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
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
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {selectedDate && selectedDayData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-1 border rounded-lg p-4 bg-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {format(new Date(selectedDate), 'MMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDayData.bills.length} bill{selectedDayData.bills.length !== 1 ? 's' : ''} · 
                      ${selectedDayData.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDate(null)}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedDayData.bills.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No bills due on this date
                    </p>
                  ) : (
                    selectedDayData.bills.map((bill) => (
                      <div
                        key={bill.id}
                        className="border rounded-lg p-3 space-y-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <MerchantLogo merchant={bill.merchant} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{bill.merchant}</p>
                            <p className="text-sm text-muted-foreground">{bill.category}</p>
                          </div>
                          <p className="font-semibold">${Number(bill.amount).toFixed(2)}</p>
                        </div>
                        
                        {bill.zombie_score && bill.zombie_score > 50 && (
                          <Badge variant="destructive" className="text-xs">
                            Zombie ({bill.zombie_score}% unused)
                          </Badge>
                        )}

                        <div className="flex gap-2">
                          {onMarkForCancellation && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => onMarkForCancellation(bill.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
