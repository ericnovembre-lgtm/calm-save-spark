import { TrendingUp, Globe } from "lucide-react";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";

interface BalanceCardProps {
  balance: number;
  monthlyGrowth?: number;
}

export const BalanceCard = ({ balance, monthlyGrowth = 245 }: BalanceCardProps) => {
  const { convertedAmount, targetCurrency, isConverted } = useCurrencyConversion(balance);
  const { convertedAmount: convertedGrowth } = useCurrencyConversion(monthlyGrowth);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)] mb-8">
      <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide flex items-center gap-2">
        Total Saved
        {isConverted && (
          <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3" />
            {targetCurrency}
          </span>
        )}
      </p>
      <h2 className="text-5xl font-display font-bold text-foreground mb-4 tabular-nums">
        {getCurrencySymbol(targetCurrency)}{convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h2>
      {isConverted && (
        <p className="text-xs text-muted-foreground mb-2">
          ≈ ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </p>
      )}
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-foreground" />
        <span className="text-foreground font-medium">
          +{getCurrencySymbol(targetCurrency)}{convertedGrowth.toLocaleString()} this month
        </span>
      </div>
    </div>
  );
};
