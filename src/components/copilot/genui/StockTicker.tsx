import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockTickerProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
}

export function StockTicker({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent,
  currency = '$',
}: StockTickerProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3"
    >
      {/* Symbol & Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{symbol}</span>
          {name && (
            <span className="text-xs text-muted-foreground truncate">{name}</span>
          )}
        </div>
      </div>
      
      {/* Price & Change */}
      <div className="text-right">
        <div className="font-semibold text-foreground">
          {currency}{price.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${
          isPositive ? 'text-success' : 
          isNegative ? 'text-destructive' : 
          'text-muted-foreground'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> :
           isNegative ? <TrendingDown className="h-3 w-3" /> :
           <Minus className="h-3 w-3" />}
          <span>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      {/* Mini sparkline indicator */}
      <div className={`w-1 h-8 rounded-full ${
        isPositive ? 'bg-success' : 
        isNegative ? 'bg-destructive' : 
        'bg-muted'
      }`} />
    </motion.div>
  );
}
