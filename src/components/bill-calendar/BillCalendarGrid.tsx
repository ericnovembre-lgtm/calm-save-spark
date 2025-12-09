import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillCalendarDay } from './BillCalendarDay';
import { Bill } from '@/hooks/useBillCalendar';
import { motion, AnimatePresence } from 'framer-motion';

interface BillCalendarGridProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  billsByDate: Map<string, Bill[]>;
  onDayClick: (date: Date, bills: Bill[]) => void;
}

export function BillCalendarGrid({ 
  selectedMonth, 
  onMonthChange, 
  billsByDate, 
  onDayClick 
}: BillCalendarGridProps) {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6" data-copilot-id="bill-calendar-grid">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-semibold text-foreground">
          {format(selectedMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(weekDay => (
          <div 
            key={weekDay} 
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {weekDay}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(selectedMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((dayDate, i) => {
            const dateKey = format(dayDate, 'yyyy-MM-dd');
            const dayBills = billsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(dayDate, selectedMonth);
            
            return (
              <BillCalendarDay
                key={dateKey}
                date={dayDate}
                bills={dayBills}
                isCurrentMonth={isCurrentMonth}
                onClick={() => onDayClick(dayDate, dayBills)}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
