import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLatestCreditScore } from "./useLatestCreditScore";
import { subMonths } from "date-fns";

export function useFinancialHealthMetrics() {
  const { data: creditData } = useLatestCreditScore();

  return useQuery({
    queryKey: ['financial-health-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get transactions from last 3 months for savings rate
      const threeMonthsAgo = subMonths(new Date(), 3);
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgo.toISOString());

      // Calculate income and expenses
      const income = transactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
      const expenses = Math.abs(transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0);
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // Get debts for debt-to-income ratio
      const { data: debts } = await supabase
        .from('debts')
        .select('minimum_payment')
        .eq('user_id', user.id);

      const monthlyDebtPayments = debts?.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0) || 0;
      const monthlyIncome = income / 3; // Average monthly income
      const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

      // Credit score (normalized to 0-100)
      const creditScore = creditData?.score || 0;
      const creditScoreNormalized = Math.min((creditScore / 850) * 100, 100);

      // Calculate composite score (weighted average)
      const compositeScore = Math.round(
        (creditScoreNormalized * 0.4) + 
        (Math.min(savingsRate * 5, 100) * 0.3) + 
        (Math.max(100 - debtToIncomeRatio * 2, 0) * 0.3)
      );

      return {
        compositeScore,
        creditScore,
        creditScoreNormalized,
        savingsRate: Math.round(savingsRate),
        debtToIncomeRatio: Math.round(debtToIncomeRatio),
        income: monthlyIncome,
        expenses: expenses / 3,
        monthlyDebtPayments,
      };
    },
    enabled: !!creditData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
