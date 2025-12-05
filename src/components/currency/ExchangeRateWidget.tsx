import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORTED_CURRENCIES, formatCurrency } from "@/lib/exchangeRates";
import { cn } from "@/lib/utils";

interface ExchangeRateWidgetProps {
  defaultFrom?: string;
  defaultTo?: string;
  compact?: boolean;
  className?: string;
}

export const ExchangeRateWidget: React.FC<ExchangeRateWidgetProps> = ({
  defaultFrom = "USD",
  defaultTo = "EUR",
  compact = false,
  className,
}) => {
  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState("100");

  // Fetch exchange rate
  const rateQuery = useQuery({
    queryKey: ["exchange-rate", fromCurrency, toCurrency],
    queryFn: async () => {
      if (fromCurrency === toCurrency) return { rate: 1, change: 0 };

      // Check cached rate first
      const { data: cached } = await supabase
        .from("exchange_rates")
        .select("rate, fetched_at")
        .eq("base_currency", fromCurrency)
        .eq("target_currency", toCurrency)
        .single();

      if (cached) {
        const fetchedAt = new Date(cached.fetched_at);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (fetchedAt > hourAgo) {
          return { rate: cached.rate, change: 0 };
        }
      }

      // Fetch fresh rate
      const { data, error } = await supabase.functions.invoke("fetch-exchange-rates", {
        body: { base: fromCurrency, target: toCurrency },
      });

      if (error) {
        return { rate: cached?.rate || 1, change: 0 };
      }

      return { rate: data?.rate || 1, change: data?.change || 0 };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
  });

  const rate = rateQuery.data?.rate || 1;
  const change = rateQuery.data?.change || 0;
  const convertedAmount = parseFloat(amount || "0") * rate;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromSymbol = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency)?.symbol || fromCurrency;
  const toSymbol = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency)?.symbol || toCurrency;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <span className="font-mono">
          1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
        </span>
        {change !== 0 && (
          <span className={cn("flex items-center gap-0.5", change > 0 ? "text-emerald-500" : "text-rose-500")}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {fromSymbol}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 font-mono"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={swapCurrencies}
            className="rounded-full h-8 w-8 p-0"
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {toSymbol}
              </span>
              <Input
                type="text"
                value={convertedAmount.toFixed(2)}
                readOnly
                className="pl-8 font-mono bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Rate Display */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {rateQuery.isLoading || rateQuery.isFetching ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : (
              <span className="font-mono text-muted-foreground">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {change !== 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  change > 0 ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(change).toFixed(2)}% (24h)
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => rateQuery.refetch()}
            disabled={rateQuery.isFetching}
            className="h-6 w-6 p-0"
          >
            <RefreshCw
              className={cn("w-3 h-3", rateQuery.isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
