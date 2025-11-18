import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelector } from "@/components/currency/CurrencySelector";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Badge } from "@/components/ui/badge";

interface MultiCurrencyBudgetFormProps {
  amount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
}

export function MultiCurrencyBudgetForm({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange
}: MultiCurrencyBudgetFormProps) {
  const { convertedAmount, targetCurrency, rate, isConverted } = useCurrencyConversion(amount, currency);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Budget Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <CurrencySelector
            value={currency}
            onChange={onCurrencyChange}
          />
        </div>
      </div>

      {isConverted && (
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your currency ({targetCurrency})</span>
            <Badge variant="outline">
              {targetCurrency} {convertedAmount.toFixed(2)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Exchange rate: 1 {currency} = {rate.toFixed(4)} {targetCurrency}
          </div>
        </div>
      )}
    </div>
  );
}
