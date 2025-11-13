import { Globe } from "lucide-react";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { SaveplusAnimIcon } from "@/components/icons";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BalanceCardProps {
  balance: number;
  monthlyGrowth?: number;
}

export const BalanceCard = ({ balance, monthlyGrowth = 245 }: BalanceCardProps) => {
  const { convertedAmount, targetCurrency, isConverted } = useCurrencyConversion(balance);
  const { convertedAmount: convertedGrowth } = useCurrencyConversion(monthlyGrowth);
  const prefersReducedMotion = useReducedMotion();

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
    <motion.div 
      className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)] mb-8 transition-all duration-300 hover:shadow-[var(--shadow-soft)] hover:scale-[1.01] hover:border-primary/20 border border-transparent"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
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
        <AnimatedCounter 
          value={convertedAmount} 
          prefix={getCurrencySymbol(targetCurrency)}
          decimals={2}
          duration={1.5}
        />
      </h2>
      {isConverted && (
        <p className="text-xs text-muted-foreground mb-2">
          ≈ ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </p>
      )}
      <motion.div 
        className="flex items-center gap-2 text-sm group"
        initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <SaveplusAnimIcon name="trending-up" size={16} className="text-primary transition-transform group-hover:scale-110" />
        <span className="text-foreground font-medium">
          +{getCurrencySymbol(targetCurrency)}{convertedGrowth.toLocaleString()} this month
        </span>
      </motion.div>
    </motion.div>
  );
};
