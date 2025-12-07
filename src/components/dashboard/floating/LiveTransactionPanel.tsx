import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveTransactionStream } from '@/components/dashboard/realtime/LiveTransactionStream';
import { LiveDot } from '@/components/dashboard/realtime/LiveDataPulse';
import { useLiveTransactionStream } from '@/hooks/useLiveTransactionStream';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export function LiveTransactionPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { transactions, isConnected, dismissTransaction, unreadCount } = useLiveTransactionStream();
  const prefersReducedMotion = useReducedMotion();

  // Don't render if no transactions
  if (unreadCount === 0 && !isExpanded) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "w-80 max-h-96 overflow-hidden rounded-xl",
              "bg-card/95 backdrop-blur-xl border border-border/50",
              "shadow-2xl shadow-black/20"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-foreground">Live Feed</span>
                {isConnected && <LiveDot isLive size="sm" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-3 overflow-y-auto max-h-72">
              {transactions.length > 0 ? (
                <LiveTransactionStream
                  transactions={transactions}
                  maxVisible={8}
                  onDismiss={dismissTransaction}
                  showLatency
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent transactions</p>
                  <p className="text-xs mt-1">New transactions will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-card/90 backdrop-blur-xl border border-border/50",
          "shadow-lg shadow-black/10",
          "hover:bg-secondary/90 transition-colors",
          isExpanded && "bg-amber-500/10 border-amber-500/30"
        )}
      >
        <div className="relative">
          <Activity className={cn(
            "h-4 w-4 transition-colors",
            isConnected ? "text-amber-600" : "text-muted-foreground"
          )} />
          {isConnected && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="h-4 w-4 text-amber-600" />
            </motion.div>
          )}
        </div>
        
        <span className="text-sm font-medium text-foreground">
          {isExpanded ? 'Hide' : 'Live'}
        </span>
        
        {/* Badge */}
        {unreadCount > 0 && !isExpanded && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-[10px] font-bold text-white"
          >
            {unreadCount}
          </motion.span>
        )}
        
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </motion.button>
    </div>
  );
}
