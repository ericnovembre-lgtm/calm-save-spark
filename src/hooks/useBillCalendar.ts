import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, parseISO, isSameDay, addDays, isBefore, isAfter } from 'date-fns';

export interface Bill {
  id: string;
  merchant: string;
  amount: number;
  dueDate: Date;
  category: string | null;
  frequency: string | null;
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid';
  isPaid?: boolean;
}

export interface BillCalendarData {
  bills: Bill[];
  billsByDate: Map<string, Bill[]>;
  totalDueThisMonth: number;
  overdueCount: number;
  upcomingCount: number;
  dueThisWeekTotal: number;
}

export function useBillCalendar(selectedMonth: Date) {
  const { user } = useAuth();
  
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  return useQuery({
    queryKey: ['bill-calendar', user?.id, format(selectedMonth, 'yyyy-MM')],
    queryFn: async (): Promise<BillCalendarData> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Fetch detected subscriptions with next_expected_date in range
      const { data: subscriptions, error } = await supabase
        .from('detected_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('next_expected_date', 'is', null);
      
      if (error) throw error;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const bills: Bill[] = (subscriptions || []).map(sub => {
        const dueDate = sub.next_expected_date ? parseISO(sub.next_expected_date) : new Date();
        
        let status: Bill['status'] = 'upcoming';
        if (isSameDay(dueDate, today)) {
          status = 'due_today';
        } else if (isBefore(dueDate, today)) {
          status = 'overdue';
        }
        
        return {
          id: sub.id,
          merchant: sub.merchant,
          amount: sub.amount,
          dueDate,
          category: sub.category,
          frequency: sub.frequency,
          status,
        };
      });
      
      // Group bills by date
      const billsByDate = new Map<string, Bill[]>();
      bills.forEach(bill => {
        const dateKey = format(bill.dueDate, 'yyyy-MM-dd');
        if (!billsByDate.has(dateKey)) {
          billsByDate.set(dateKey, []);
        }
        billsByDate.get(dateKey)!.push(bill);
      });
      
      // Calculate totals
      const billsThisMonth = bills.filter(b => 
        !isBefore(b.dueDate, monthStart) && !isAfter(b.dueDate, monthEnd)
      );
      
      const weekFromNow = addDays(today, 7);
      const billsDueThisWeek = bills.filter(b => 
        !isBefore(b.dueDate, today) && !isAfter(b.dueDate, weekFromNow)
      );
      
      return {
        bills,
        billsByDate,
        totalDueThisMonth: billsThisMonth.reduce((sum, b) => sum + b.amount, 0),
        overdueCount: bills.filter(b => b.status === 'overdue').length,
        upcomingCount: bills.filter(b => b.status === 'upcoming').length,
        dueThisWeekTotal: billsDueThisWeek.reduce((sum, b) => sum + b.amount, 0),
      };
    },
    enabled: !!user?.id,
  });
}
