import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useWalletSettings } from "@/hooks/useWalletSettings";
import { formatCurrency } from "@/lib/exchangeRates";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TokenBalanceCardProps {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon?: string;
  livePrice?: number;
  lastUpdate?: string;
  isLive?: boolean;
  sparklineData?: number[];
  isStablecoin?: boolean;
}

export function TokenBalanceCard({
  symbol,
  name,
  balance,
  usdValue,
  change24h,
  icon,
  livePrice,
  lastUpdate,
  isLive = false,
  sparklineData = [],
  isStablecoin = false,
}: TokenBalanceCardProps) {
  const isPositive = change24h >= 0;
  const { settings } = useWalletSettings();
  const prefersReducedMotion = useReducedMotion();
  
  const displayCurrency = settings?.display_currency || 'USD';
  const formattedValue = formatCurrency(usdValue, displayCurrency);

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Token Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold text-foreground border border-border group-hover:border-primary/30 transition-colors">
            {icon || symbol.charAt(0)}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-semibold text-foreground">{symbol}</h3>
              {isLive && (
                <motion.div
                  animate={prefersReducedMotion ? {} : { opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-success/10 border border-success/20 rounded-full"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[10px] text-success font-medium">LIVE</span>
                </motion.div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            {settings?.hide_balance ? '••••' : formattedValue}
          </p>
          {!isStablecoin && (
            <div className={`flex items-center gap-1.5 justify-end text-xs font-medium mt-1 ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className="text-sm font-semibold text-foreground">
            {settings?.hide_balance ? '••••' : balance.toFixed(6)}
          </p>
        </div>
        
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(lastUpdate).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Mini Sparkline */}
      {sparklineData.length > 0 && (
        <div className="h-12 mt-4 flex items-end gap-0.5 opacity-40">
          {sparklineData.slice(-20).map((value, i) => {
            const maxValue = Math.max(...sparklineData.slice(-20));
            const minValue = Math.min(...sparklineData.slice(-20));
            const normalizedHeight = ((value - minValue) / (maxValue - minValue)) * 100;
            
            return (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? { height: `${normalizedHeight}%` } : { height: 0 }}
                animate={{ height: `${normalizedHeight}%` }}
                transition={{ delay: prefersReducedMotion ? 0 : i * 0.02, duration: 0.3 }}
                className={`flex-1 rounded-t min-h-[2px] ${isPositive ? 'bg-success/40' : 'bg-destructive/40'}`}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}