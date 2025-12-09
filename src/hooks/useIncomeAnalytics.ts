import { useMemo } from 'react';
import { useIncomeEntries, IncomeEntry, IncomeFrequency, IncomeSourceType } from './useIncomeEntries';

const FREQUENCY_MULTIPLIERS: Record<IncomeFrequency, number> = {
  one_time: 0,
  weekly: 52,
  bi_weekly: 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

const MONTHLY_MULTIPLIERS: Record<IncomeFrequency, number> = {
  one_time: 0,
  weekly: 4.33,
  bi_weekly: 2.17,
  monthly: 1,
  quarterly: 0.33,
  annually: 0.083,
};

export interface IncomeByType {
  type: IncomeSourceType;
  label: string;
  monthlyAmount: number;
  annualAmount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface IncomeProjection {
  month: string;
  projected: number;
  actual?: number;
}

const SOURCE_TYPE_LABELS: Record<IncomeSourceType, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investments',
  rental: 'Rental',
  business: 'Business',
  side_hustle: 'Side Hustle',
  pension: 'Pension',
  benefits: 'Benefits',
  gift: 'Gifts',
  other: 'Other',
};

const SOURCE_TYPE_COLORS: Record<IncomeSourceType, string> = {
  salary: 'hsl(var(--chart-1))',
  freelance: 'hsl(var(--chart-2))',
  investment: 'hsl(var(--chart-3))',
  rental: 'hsl(var(--chart-4))',
  business: 'hsl(var(--chart-5))',
  side_hustle: 'hsl(43, 74%, 66%)',
  pension: 'hsl(43, 74%, 49%)',
  benefits: 'hsl(30, 80%, 55%)',
  gift: 'hsl(25, 95%, 53%)',
  other: 'hsl(var(--muted-foreground))',
};

function calculateMonthlyAmount(entry: IncomeEntry): number {
  return entry.amount * MONTHLY_MULTIPLIERS[entry.frequency];
}

function calculateAnnualAmount(entry: IncomeEntry): number {
  if (entry.frequency === 'one_time') {
    return entry.amount;
  }
  return entry.amount * FREQUENCY_MULTIPLIERS[entry.frequency];
}

export function useIncomeAnalytics() {
  const { incomeEntries, activeEntries, isLoading, error } = useIncomeEntries();

  const analytics = useMemo(() => {
    if (!activeEntries.length) {
      return {
        totalMonthly: 0,
        totalAnnual: 0,
        totalMonthlyAfterTax: 0,
        totalAnnualAfterTax: 0,
        byType: [] as IncomeByType[],
        projections: [] as IncomeProjection[],
        sourceCount: 0,
        averagePerSource: 0,
      };
    }

    // Calculate totals
    const totalMonthly = activeEntries.reduce((sum, e) => sum + calculateMonthlyAmount(e), 0);
    const totalAnnual = activeEntries.reduce((sum, e) => sum + calculateAnnualAmount(e), 0);
    
    // Calculate after-tax (subtract tax_withheld)
    const totalMonthlyTaxWithheld = activeEntries.reduce((sum, e) => {
      const monthlyTax = e.tax_withheld * MONTHLY_MULTIPLIERS[e.frequency];
      return sum + monthlyTax;
    }, 0);
    
    const totalMonthlyAfterTax = totalMonthly - totalMonthlyTaxWithheld;
    const totalAnnualAfterTax = totalAnnual - (totalMonthlyTaxWithheld * 12);

    // Group by type
    const typeMap = new Map<IncomeSourceType, { monthly: number; annual: number; count: number }>();
    
    activeEntries.forEach(entry => {
      const existing = typeMap.get(entry.source_type) || { monthly: 0, annual: 0, count: 0 };
      typeMap.set(entry.source_type, {
        monthly: existing.monthly + calculateMonthlyAmount(entry),
        annual: existing.annual + calculateAnnualAmount(entry),
        count: existing.count + 1,
      });
    });

    const byType: IncomeByType[] = Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        label: SOURCE_TYPE_LABELS[type],
        monthlyAmount: data.monthly,
        annualAmount: data.annual,
        percentage: totalMonthly > 0 ? (data.monthly / totalMonthly) * 100 : 0,
        count: data.count,
        color: SOURCE_TYPE_COLORS[type],
      }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

    // Generate 12-month projection
    const projections: IncomeProjection[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      projections.push({
        month: monthStr,
        projected: totalMonthly,
      });
    }

    return {
      totalMonthly,
      totalAnnual,
      totalMonthlyAfterTax,
      totalAnnualAfterTax,
      byType,
      projections,
      sourceCount: activeEntries.length,
      averagePerSource: activeEntries.length > 0 ? totalMonthly / activeEntries.length : 0,
    };
  }, [activeEntries]);

  return {
    ...analytics,
    incomeEntries,
    activeEntries,
    isLoading,
    error,
  };
}
