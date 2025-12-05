import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BudgetDialProps {
  category: string;
  spent: number;
  budget: number;
  currency?: string;
  onAdjust?: (newBudget: number) => void;
}

export function BudgetDial({ 
  category, 
  spent, 
  budget,
  currency = '$',
}: BudgetDialProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const { percentage, status, statusColor, remaining } = useMemo(() => {
    const pct = Math.min((spent / budget) * 100, 100);
    const rem = budget - spent;
    
    let stat: 'good' | 'warning' | 'danger' = 'good';
    let color = 'hsl(var(--success))';
    
    if (pct >= 90) {
      stat = 'danger';
      color = 'hsl(var(--destructive))';
    } else if (pct >= 75) {
      stat = 'warning';
      color = 'hsl(var(--warning))';
    }
    
    return { 
      percentage: pct, 
      status: stat, 
      statusColor: color,
      remaining: rem,
    };
  }, [spent, budget]);
  
  // SVG arc calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-foreground">{category}</span>
      </div>
      
      {/* Dial */}
      <div className="relative w-28 h-28 mx-auto">
        <svg 
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          
          {/* Progress arc */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={prefersReducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-2xl font-bold text-foreground"
            initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
          <span className="text-xs text-muted-foreground">used</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Spent</div>
          <div className="text-sm font-semibold text-foreground">
            {currency}{spent.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">
            {remaining >= 0 ? 'Left' : 'Over'}
          </div>
          <div className={`text-sm font-semibold ${
            remaining >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {currency}{Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Status badge */}
      <div className="mt-2 flex justify-center">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'good' ? 'bg-success/10 text-success' :
          status === 'warning' ? 'bg-warning/10 text-warning' :
          'bg-destructive/10 text-destructive'
        }`}>
          {status === 'good' ? 'On Track' :
           status === 'warning' ? 'Watch Spending' :
           'Over Budget'}
        </span>
      </div>
    </div>
  );
}
