import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  merchant: string;
  avg_amount: number;
  frequency: string;
  category: string | null;
  last_occurrence: string;
  expected_date: number | null;
  confidence: number;
  detected_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RecurringSummary {
  totalMonthly: number;
  totalCount: number;
  highConfidenceCount: number;
  categories: Record<string, { count: number; total: number }>;
  upcomingThisMonth: number;
}

function calculateSummary(transactions: RecurringTransaction[]): RecurringSummary {
  const summary: RecurringSummary = {
    totalMonthly: 0,
    totalCount: transactions.length,
    highConfidenceCount: 0,
    categories: {},
    upcomingThisMonth: 0,
  };

  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  transactions.forEach(tx => {
    // Calculate monthly equivalent
    let monthlyAmount = tx.avg_amount;
    if (tx.frequency === 'weekly') {
      monthlyAmount = tx.avg_amount * 4.33;
    } else if (tx.frequency === 'biweekly') {
      monthlyAmount = tx.avg_amount * 2.17;
    } else if (tx.frequency === 'yearly') {
      monthlyAmount = tx.avg_amount / 12;
    } else if (tx.frequency === 'quarterly') {
      monthlyAmount = tx.avg_amount / 3;
    }

    summary.totalMonthly += Math.abs(monthlyAmount);

    // Count high confidence
    if (tx.confidence >= 0.8) {
      summary.highConfidenceCount++;
    }

    // Group by category
    const cat = tx.category || 'Uncategorized';
    if (!summary.categories[cat]) {
      summary.categories[cat] = { count: 0, total: 0 };
    }
    summary.categories[cat].count++;
    summary.categories[cat].total += Math.abs(monthlyAmount);

    // Check if upcoming this month
    if (tx.expected_date && tx.expected_date > currentDay && tx.expected_date <= daysInMonth) {
      summary.upcomingThisMonth++;
    }
  });

  return summary;
}

export function useRecurringTransactions() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('avg_amount', { ascending: false });

      if (error) throw error;
      return (data || []) as RecurringTransaction[];
    },
  });

  const transactions = data || [];
  const summary = calculateSummary(transactions);

  return {
    transactions,
    summary,
    isLoading,
    error,
    refetch,
  };
}
