import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBillCalendar, Bill } from '@/hooks/useBillCalendar';
import { BillCalendarGrid } from '@/components/bill-calendar/BillCalendarGrid';
import { BillCalendarListView } from '@/components/bill-calendar/BillCalendarListView';
import { BillDetailPopover } from '@/components/bill-calendar/BillDetailPopover';
import { BillRemindersManager } from '@/components/bill-calendar/BillRemindersManager';
import { BillPaymentModal } from '@/components/bill-calendar/BillPaymentModal';
import { CalendarViewToggle, CalendarView } from '@/components/bill-calendar/CalendarViewToggle';
import { UpcomingBillsOverview } from '@/components/bill-calendar/UpcomingBillsOverview';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

export default function BillCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [view, setView] = useState<CalendarView>('calendar');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const { data, isLoading } = useBillCalendar(selectedMonth);
  
  const handleDayClick = (date: Date, bills: Bill[]) => {
    if (bills.length === 1) {
      setSelectedBill(bills[0]);
      setShowDetail(true);
    } else if (bills.length > 1) {
      // For multiple bills, switch to list view filtered to that day
      setView('list');
    }
  };
  
  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetail(true);
  };
  
  const handlePayNow = (bill: Bill) => {
    setShowDetail(false);
    setSelectedBill(bill);
    setShowPayment(true);
  };
  
  const handleSetReminder = (bill: Bill) => {
    setShowDetail(false);
    setSelectedBill(bill);
    setShowReminder(true);
  };
  
  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6" data-copilot-id="bill-calendar-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bill Calendar</h1>
              <p className="text-sm text-muted-foreground">Track upcoming bills and payments</p>
            </div>
          </div>
          
          <CalendarViewToggle view={view} onChange={setView} />
        </div>
        
        {/* Overview Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : data && (
          <UpcomingBillsOverview data={data} />
        )}
        
        {/* Calendar/List View */}
        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : data && (
          view === 'calendar' ? (
            <BillCalendarGrid
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              billsByDate={data.billsByDate}
              onDayClick={handleDayClick}
            />
          ) : (
            <BillCalendarListView
              bills={data.bills}
              onBillClick={handleBillClick}
            />
          )
        )}
        
        {/* Modals */}
        <BillDetailPopover
          bill={selectedBill}
          open={showDetail}
          onOpenChange={setShowDetail}
          onPayNow={handlePayNow}
          onSetReminder={handleSetReminder}
        />
        
        <BillRemindersManager
          bill={selectedBill}
          open={showReminder}
          onOpenChange={setShowReminder}
        />
        
        <BillPaymentModal
          bill={selectedBill}
          open={showPayment}
          onOpenChange={setShowPayment}
        />
      </div>
    </AppLayout>
  );
}
