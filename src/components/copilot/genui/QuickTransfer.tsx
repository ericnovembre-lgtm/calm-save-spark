import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface QuickTransferProps {
  fromAccounts?: Account[];
  toAccounts?: Account[];
  defaultAmount?: number;
  onTransfer?: (from: string, to: string, amount: number) => Promise<void>;
  currency?: string;
}

export function QuickTransfer({ 
  fromAccounts = [],
  toAccounts = [],
  defaultAmount = 0,
  onTransfer,
  currency = '$',
}: QuickTransferProps) {
  const [fromId, setFromId] = useState(fromAccounts[0]?.id ?? '');
  const [toId, setToId] = useState(toAccounts[0]?.id ?? '');
  const [amount, setAmount] = useState(defaultAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const handleTransfer = async () => {
    if (!fromId || !toId || amount <= 0 || !onTransfer) return;
    
    setIsLoading(true);
    try {
      await onTransfer(fromId, toId, amount);
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 3000);
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isComplete) {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-success/10 border border-success/20 rounded-lg p-4 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="h-6 w-6 text-success" />
        </div>
        <p className="text-sm font-medium text-success">Transfer Complete!</p>
        <p className="text-xs text-muted-foreground mt-1">
          {currency}{amount.toLocaleString()} transferred successfully
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      <div className="text-sm font-medium text-foreground">Quick Transfer</div>
      
      {/* From/To selectors */}
      <div className="flex items-center gap-2">
        <select
          value={fromId}
          onChange={e => setFromId(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          disabled={fromAccounts.length === 0}
        >
          {fromAccounts.length === 0 ? (
            <option>No accounts</option>
          ) : (
            fromAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({currency}{acc.balance.toLocaleString()})
              </option>
            ))
          )}
        </select>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        
        <select
          value={toId}
          onChange={e => setToId(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          disabled={toAccounts.length === 0}
        >
          {toAccounts.length === 0 ? (
            <option>No accounts</option>
          ) : (
            toAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))
          )}
        </select>
      </div>
      
      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {currency}
        </span>
        <Input
          type="number"
          value={amount || ''}
          onChange={e => setAmount(Number(e.target.value))}
          placeholder="0.00"
          className="pl-7"
          min={0}
        />
      </div>
      
      {/* Transfer button */}
      <Button 
        onClick={handleTransfer}
        disabled={isLoading || !fromId || !toId || amount <= 0}
        className="w-full"
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Transferring...
          </>
        ) : (
          'Transfer Now'
        )}
      </Button>
    </motion.div>
  );
}
