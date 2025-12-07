import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category?: string;
  categoryIcon?: string;
  timestamp: Date;
  type: 'income' | 'expense';
  latencyMs?: number; // Groq processing latency
}

interface LiveTransactionStreamProps {
  transactions: Transaction[];
  maxVisible?: number;
  onDismiss?: (id: string) => void;
  onCategorize?: (id: string) => void;
  showLatency?: boolean;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  food: '🍔',
  shopping: '🛒',
  transport: '🚗',
  entertainment: '🎬',
  utilities: '💡',
  health: '💊',
  income: '💰',
  transfer: '↔️',
  default: '💳',
};

export function LiveTransactionStream({
  transactions,
  maxVisible = 5,
  onDismiss,
  onCategorize,
  showLatency = false,
  className,
}: LiveTransactionStreamProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleTransactions = transactions.slice(0, maxVisible);

  if (visibleTransactions.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap className="h-3 w-3 text-amber-400" />
        </motion.div>
        <span className="text-xs font-medium text-muted-foreground">
          Live Transactions
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {transactions.length} new
        </span>
      </div>

      {/* Transaction List */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {visibleTransactions.map((tx, index) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              index={index}
              onDismiss={onDismiss}
              onCategorize={onCategorize}
              showLatency={showLatency}
              reduced={prefersReducedMotion}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more indicator */}
      {transactions.length > maxVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground py-1"
        >
          +{transactions.length - maxVisible} more
        </motion.div>
      )}
    </div>
  );
}

function TransactionItem({
  transaction,
  index,
  onDismiss,
  onCategorize,
  showLatency,
  reduced,
}: {
  transaction: Transaction;
  index: number;
  onDismiss?: (id: string) => void;
  onCategorize?: (id: string) => void;
  showLatency?: boolean;
  reduced: boolean;
}) {
  const isExpense = transaction.type === 'expense';
  const icon = categoryIcons[transaction.category || 'default'];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <motion.div
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        layout: { duration: 0.2 },
      }}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 rounded-lg',
        'bg-white/5 border border-white/10 hover:bg-white/10',
        'transition-colors duration-200'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm',
        isExpense ? 'bg-rose-500/10' : 'bg-emerald-500/10'
      )}>
        {icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {transaction.merchant}
          </span>
          {showLatency && transaction.latencyMs && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-mono">
              {transaction.latencyMs}ms
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTime(transaction.timestamp)}
          {transaction.category && ` • ${transaction.category}`}
        </span>
      </div>

      {/* Amount */}
      <div className={cn(
        'flex items-center gap-1 font-medium tabular-nums',
        isExpense ? 'text-rose-400' : 'text-emerald-400'
      )}>
        {isExpense ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownLeft className="h-3 w-3" />
        )}
        <span>${Math.abs(transaction.amount).toFixed(2)}</span>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onCategorize && !transaction.category && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => onCategorize(transaction.id)}
          >
            <span className="text-xs">📋</span>
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-rose-400"
            onClick={() => onDismiss(transaction.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
