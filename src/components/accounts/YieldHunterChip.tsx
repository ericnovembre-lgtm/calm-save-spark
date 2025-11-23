import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface YieldOpportunity {
  fromAccount: string;
  fromName: string;
  toAccount: string;
  toName: string;
  amount: number;
  annualEarnings: number;
  savingsAPY: number;
}

interface YieldHunterChipProps {
  onTransferClick: (fromAccountId: string, toAccountId: string, amount: number) => void;
}

export const YieldHunterChip = ({ onTransferClick }: YieldHunterChipProps) => {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data } = await supabase.functions.invoke('analyze-yield-opportunities');
        
        if (data?.opportunities && data.opportunities.length > 0) {
          setOpportunities(data.opportunities);
        }
      } catch (error) {
        console.error('Error fetching yield opportunities:', error);
      }
    };

    fetchOpportunities();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage with 24h expiry
    const dismissTime = Date.now();
    localStorage.setItem('yield-hunter-dismissed', dismissTime.toString());
  };

  // Check if dismissed in last 24h
  useEffect(() => {
    const dismissTime = localStorage.getItem('yield-hunter-dismissed');
    if (dismissTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('yield-hunter-dismissed');
      }
    }
  }, []);

  if (opportunities.length === 0 || isDismissed) {
    return null;
  }

  const topOpportunity = opportunities[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-24 left-6 z-30"
      >
        {!isExpanded ? (
          <motion.button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-3 bg-success text-success-foreground rounded-full shadow-glass-elevated hover:shadow-glass-elevated-hover transition-shadow"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">+${topOpportunity.annualEarnings.toFixed(0)}/year</span>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ✨
            </motion.div>
          </motion.button>
        ) : (
          <Card className="w-80 shadow-glass-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <CardTitle className="text-lg">Yield Hunter</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Found an optimization opportunity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Move <span className="font-semibold text-foreground">${topOpportunity.amount.toFixed(0)}</span> from{' '}
                <span className="font-semibold text-foreground">{topOpportunity.fromName}</span> to{' '}
                <span className="font-semibold text-foreground">{topOpportunity.toName}</span>
              </p>

              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success">
                  Earn an extra ${topOpportunity.annualEarnings.toFixed(0)}/year
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {topOpportunity.savingsAPY.toFixed(2)}% APY
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1"
                  size="sm"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={() => {
                    onTransferClick(
                      topOpportunity.fromAccount,
                      topOpportunity.toAccount,
                      topOpportunity.amount
                    );
                    setIsExpanded(false);
                  }}
                  className="flex-1"
                  size="sm"
                >
                  Transfer Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  );
};