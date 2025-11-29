import { DollarSign, Receipt, Tag, TrendingUp } from "lucide-react";
import { MetricsCard } from "./MetricsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SpendingOverviewCardsProps {
  totalSpending: number;
  transactionCount: number;
  topCategory: string;
  averageTransaction: number;
  spendingChange: number;
  transactionChange: number;
  dailyData: { date: string; amount: number }[];
  isLoading?: boolean;
}

export function SpendingOverviewCards({
  totalSpending,
  transactionCount,
  topCategory,
  averageTransaction,
  spendingChange,
  transactionChange,
  dailyData,
  isLoading,
}: SpendingOverviewCardsProps) {
  // Create trend data from daily amounts
  const trendData = dailyData.slice(-14).map(d => d.amount);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-orbital" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Total Spending"
        value={totalSpending}
        change={spendingChange}
        trend={trendData}
        icon={DollarSign}
        color="text-primary"
        format="currency"
      />
      <MetricsCard
        title="Transactions"
        value={transactionCount}
        change={transactionChange}
        icon={Receipt}
        color="text-chart-2"
        format="number"
      />
      <MetricsCard
        title="Top Category"
        value={topCategory}
        icon={Tag}
        color="text-chart-3"
      />
      <MetricsCard
        title="Avg. Transaction"
        value={averageTransaction}
        icon={TrendingUp}
        color="text-chart-4"
        format="currency"
      />
    </div>
  );
}
