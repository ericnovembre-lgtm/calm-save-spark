import { TrendingUp } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  monthlyGrowth?: number;
}

export const BalanceCard = ({ balance, monthlyGrowth = 245 }: BalanceCardProps) => {
  return (
    <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)] mb-8">
      <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
        Total Saved
      </p>
      <h2 className="text-5xl font-display font-bold text-foreground mb-4 tabular-nums">
        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h2>
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-foreground" />
        <span className="text-foreground font-medium">
          +${monthlyGrowth.toLocaleString()} this month
        </span>
      </div>
    </div>
  );
};
