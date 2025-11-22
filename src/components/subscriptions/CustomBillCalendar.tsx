import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MerchantLogo } from "./MerchantLogo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Bill {
  id: string;
  merchant: string;
  amount: number;
  billing_cycle_end?: string;
  zombie_score?: number;
  status?: string;
  payment_method?: string;
}

interface CustomBillCalendarProps {
  bills: Bill[];
  onMarkForCancellation?: (billId: string) => void;
}

type ViewMode = "month" | "week";
type FilterType = "all" | "high-value" | "due-soon" | "zombies";

export function CustomBillCalendar({ bills, onMarkForCancellation }: CustomBillCalendarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [filter, setFilter] = useState<FilterType>("all");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const weekStart = startOfWeek(currentMonth);
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  // Filter bills based on active filter
  const getFilteredBills = () => {
    return bills.filter(bill => {
      if (filter === "high-value") return bill.amount > 100;
      if (filter === "due-soon") {
        const dueDate = bill.billing_cycle_end ? new Date(bill.billing_cycle_end) : null;
        if (!dueDate) return false;
        const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= 7;
      }
      if (filter === "zombies") return (bill.zombie_score ?? 0) > 70;
      return true;
    });
  };

  const filteredBills = getFilteredBills();

  // Get bills for a specific date
  const getBillsForDate = (date: Date) => {
    return filteredBills.filter(bill => {
      if (!bill.billing_cycle_end) return false;
      return isSameDay(new Date(bill.billing_cycle_end), date);
    });
  };

  // Get total amount for a date
  const getTotalForDate = (date: Date) => {
    return getBillsForDate(date).reduce((sum, bill) => sum + bill.amount, 0);
  };

  // Get color intensity based on amount
  const getColorIntensity = (amount: number) => {
    if (amount === 0) return "bg-muted/20";
    if (amount < 50) return "bg-primary/20";
    if (amount < 100) return "bg-primary/40";
    if (amount < 200) return "bg-primary/60";
    return "bg-primary/80";
  };

  const hasHighValueBills = (date: Date) => {
    return getBillsForDate(date).some(bill => bill.amount > 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedDate(date);
    } else if (e.key === "Escape") {
      setSelectedDate(null);
    }
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const selectedBills = selectedDate ? getBillsForDate(selectedDate) : [];
  const selectedTotal = selectedBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Bill Calendar
            </CardTitle>
            <CardDescription>Interactive calendar showing your upcoming bills</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Week
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg ml-2 min-w-[160px]">
                {format(currentMonth, "MMMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Bills
          </Button>
          <Button
            variant={filter === "high-value" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("high-value")}
          >
            High Value (&gt;$100)
          </Button>
          <Button
            variant={filter === "due-soon" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("due-soon")}
          >
            Due Soon (7 days)
          </Button>
          <Button
            variant={filter === "zombies" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("zombies")}
          >
            Zombies
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          {/* Calendar Grid */}
          <div>
            {viewMode === "month" ? (
              <div className="space-y-2">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const dayBills = getBillsForDate(day);
                    const total = getTotalForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const hasHighValue = hasHighValueBills(day);

                    return (
                      <TooltipProvider key={day.toString()}>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <motion.button
                              onClick={() => setSelectedDate(day)}
                              onKeyDown={(e) => handleKeyDown(e, day)}
                              whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
                              whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
                              className={cn(
                                "relative h-12 md:h-16 rounded-lg border-2 transition-all duration-200",
                                "flex flex-col items-center justify-center cursor-pointer",
                                "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                getColorIntensity(total),
                                isSelected && "ring-2 ring-primary scale-105 shadow-lg",
                                !isCurrentMonth && "opacity-40",
                                isTodayDate && "border-accent",
                                !isTodayDate && "border-transparent"
                              )}
                            >
                              <span className={cn(
                                "text-sm font-medium",
                                isTodayDate && "text-accent-foreground font-bold"
                              )}>
                                {format(day, "d")}
                              </span>
                              {dayBills.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ${total.toFixed(0)}
                                </span>
                              )}
                              {hasHighValue && (
                                <motion.div
                                  animate={!prefersReducedMotion ? {
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 1, 0.5]
                                  } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500"
                                />
                              )}
                            </motion.button>
                          </TooltipTrigger>
                          {dayBills.length > 0 && (
                            <TooltipContent side="top" className="w-[300px] p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">{format(day, "MMMM d, yyyy")}</span>
                                  <Badge variant="secondary">${total.toFixed(2)}</Badge>
                                </div>
                                <div className="space-y-2">
                                  {dayBills.slice(0, 3).map((bill) => (
                                    <div key={bill.id} className="flex items-center gap-2">
                                      <MerchantLogo merchant={bill.merchant} size="sm" />
                                      <span className="flex-1 text-sm truncate">{bill.merchant}</span>
                                      <span className="text-sm font-medium">${bill.amount.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  {dayBills.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{dayBills.length - 3} more bills
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground border-t pt-2">
                                  Click to view details and quick actions
                                </p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Week View
              <div className="space-y-4">
                {weekDays.map((day) => {
                  const dayBills = getBillsForDate(day);
                  const total = getTotalForDate(day);
                  const isTodayDate = isToday(day);

                  return (
                    <motion.div
                      key={day.toString()}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "rounded-lg border-2 p-4 space-y-3",
                        isTodayDate ? "border-accent bg-accent/5" : "border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{format(day, "EEEE")}</h4>
                          <p className="text-sm text-muted-foreground">{format(day, "MMMM d, yyyy")}</p>
                        </div>
                        {dayBills.length > 0 && (
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            ${total.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      
                      {dayBills.length > 0 ? (
                        <div className="space-y-2">
                          {dayBills.map((bill) => (
                            <div key={bill.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                              <MerchantLogo merchant={bill.merchant} size="md" />
                              <div className="flex-1">
                                <p className="font-medium">{bill.merchant}</p>
                                <p className="text-sm text-muted-foreground">${bill.amount.toFixed(2)}</p>
                              </div>
                              {onMarkForCancellation && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onMarkForCancellation(bill.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No bills due</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-sm flex-wrap">
              <span className="text-muted-foreground">Amount:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-muted/20 border" />
                <span className="text-xs">$0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 border" />
                <span className="text-xs">$1-50</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/40 border" />
                <span className="text-xs">$50-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/60 border" />
                <span className="text-xs">$100-200</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/80 border" />
                <span className="text-xs">$200+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded bg-primary/40 border">
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <span className="text-xs">High value (&gt;$100)</span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {selectedDate && selectedBills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="xl:sticky xl:top-4 xl:h-fit"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {format(selectedDate, "MMMM d, yyyy")}
                        </CardTitle>
                        <CardDescription>
                          {selectedBills.length} {selectedBills.length === 1 ? "bill" : "bills"} due
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDate(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        Total: ${selectedTotal.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedBills.map((bill) => (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg border space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <MerchantLogo merchant={bill.merchant} size="md" />
                          <div className="flex-1">
                            <p className="font-medium">{bill.merchant}</p>
                            <p className="text-sm text-muted-foreground">
                              ${bill.amount.toFixed(2)}
                            </p>
                          </div>
                          {bill.zombie_score && bill.zombie_score > 70 && (
                            <Badge variant="destructive" className="text-xs">
                              Zombie
                            </Badge>
                          )}
                        </div>
                        
                        {onMarkForCancellation && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => onMarkForCancellation(bill.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
