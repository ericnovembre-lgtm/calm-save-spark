import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TokenBalanceCardProps {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon?: string;
}

export function TokenBalanceCard({
  symbol,
  name,
  balance,
  usdValue,
  change24h,
  icon,
}: TokenBalanceCardProps) {
  const isPositive = change24h >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card/60 backdrop-blur-xl border-2 border-border rounded-xl p-4 hover:border-accent/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            {icon ? (
              <img src={icon} alt={symbol} className="w-6 h-6" />
            ) : (
              <span className="text-sm font-bold text-foreground">{symbol[0]}</span>
            )}
          </div>
          <div>
            <div className="font-bold text-foreground">{symbol}</div>
            <div className="text-xs text-muted-foreground">{name}</div>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">
          {balance.toFixed(4)}
        </div>
        <div className="text-sm text-muted-foreground">
          ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      {/* Mini Sparkline */}
      <div className="h-8 mt-3 flex items-end gap-0.5">
        {[...Array(20)].map((_, i) => {
          const height = 20 + Math.random() * 60;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.02 }}
              className={`flex-1 rounded-t ${isPositive ? 'bg-success/30' : 'bg-destructive/30'}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}