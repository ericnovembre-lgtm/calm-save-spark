import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonItem {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'currency' | 'percent' | 'number';
}

interface ComparisonTableProps {
  title?: string;
  labelA: string;
  labelB: string;
  items: ComparisonItem[];
  currency?: string;
}

export function ComparisonTable({ 
  title,
  labelA, 
  labelB, 
  items,
  currency = '$',
}: ComparisonTableProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return `${currency}${value.toLocaleString(undefined, { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        })}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };
  
  const getChange = (a: number, b: number) => {
    const diff = b - a;
    const pct = ((b - a) / a) * 100;
    return { diff, pct, isPositive: diff > 0, isNegative: diff < 0 };
  };
  
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-border text-xs font-medium text-muted-foreground">
        <div></div>
        <div className="text-center">{labelA}</div>
        <div className="text-center">{labelB}</div>
        <div className="text-center">Change</div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const change = getChange(item.valueA, item.valueB);
          
          return (
            <motion.div
              key={item.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-4 gap-2 px-4 py-2 text-sm"
            >
              <div className="text-foreground font-medium truncate">{item.label}</div>
              <div className="text-center text-muted-foreground">
                {formatValue(item.valueA, item.format)}
              </div>
              <div className="text-center text-foreground font-medium">
                {formatValue(item.valueB, item.format)}
              </div>
              <div className={`flex items-center justify-center gap-1 ${
                change.isPositive ? 'text-success' : 
                change.isNegative ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {change.isPositive ? <TrendingUp className="h-3 w-3" /> :
                 change.isNegative ? <TrendingDown className="h-3 w-3" /> :
                 <Minus className="h-3 w-3" />}
                <span className="text-xs">
                  {change.pct >= 0 ? '+' : ''}{change.pct.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
