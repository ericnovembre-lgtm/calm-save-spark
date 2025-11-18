import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Lightbulb, TrendingDown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ContextualCoachTipProps {
  userId: string;
  pageName: string;
  onChatOpen: (message: string) => void;
}

interface CoachTip {
  id: string;
  category: 'strategy' | 'motivation' | 'optimization' | 'celebration';
  title: string;
  message: string;
  actionMessage: string;
  icon: any;
}

export default function ContextualCoachTip({ userId, pageName, onChatOpen }: ContextualCoachTipProps) {
  const [tip, setTip] = useState<CoachTip | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadTip();
  }, [userId]);

  const loadTip = async () => {
    try {
      // Fetch debts to generate contextual tips
      const { data: debts } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (!debts || debts.length === 0) return;

      // Generate tip based on debt situation
      const tips: CoachTip[] = [];

      // High interest rate tip
      const highInterestDebts = debts.filter(d => Number(d.interest_rate) > 20);
      if (highInterestDebts.length > 0) {
        const debt = highInterestDebts[0];
        tips.push({
          id: 'high-interest',
          category: 'strategy',
          title: 'High Interest Alert',
          message: `Your ${debt.debt_name} has a ${debt.interest_rate}% interest rate. Consider the avalanche method to save on interest!`,
          actionMessage: `How can I reduce interest on my ${debt.debt_name}?`,
          icon: TrendingDown,
        });
      }

      // Small debt close to payoff
      const smallDebts = debts.filter(d => {
        const progress = d.original_balance 
          ? ((Number(d.original_balance) - Number(d.current_balance)) / Number(d.original_balance)) * 100 
          : 0;
        return progress > 80 && Number(d.current_balance) < 1000;
      });
      if (smallDebts.length > 0) {
        const debt = smallDebts[0];
        tips.push({
          id: 'almost-paid',
          category: 'motivation',
          title: 'Almost There!',
          message: `You're only $${Number(debt.current_balance).toLocaleString()} away from paying off ${debt.debt_name}. Keep going!`,
          actionMessage: `Show me strategies to pay off ${debt.debt_name} faster`,
          icon: Zap,
        });
      }

      // Extra payments celebration
      const extraPaymentDebts = debts.filter(d => 
        Number(d.actual_payment || 0) > Number(d.minimum_payment)
      );
      if (extraPaymentDebts.length > 0) {
        const extraTotal = extraPaymentDebts.reduce((sum, d) => 
          sum + (Number(d.actual_payment || 0) - Number(d.minimum_payment)), 0
        );
        tips.push({
          id: 'extra-payments',
          category: 'celebration',
          title: 'Great Progress!',
          message: `You're paying an extra $${extraTotal.toLocaleString()} per month above minimums. At this rate, you'll be debt-free much sooner!`,
          actionMessage: 'Show me how much faster I can become debt-free',
          icon: Lightbulb,
        });
      }

      // Select random tip
      if (tips.length > 0) {
        setTip(tips[Math.floor(Math.random() * tips.length)]);
      }
    } catch (error) {
      console.error('Error loading coach tip:', error);
    }
  };

  if (!tip || dismissed) return null;

  const Icon = tip.icon;
  const categoryColors = {
    strategy: 'bg-primary/10 text-primary border-primary/20',
    motivation: 'bg-secondary/10 text-secondary border-secondary/20',
    optimization: 'bg-accent/10 text-accent border-accent/20',
    celebration: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`p-4 border-2 ${categoryColors[tip.category]}`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{tip.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChatOpen(tip.actionMessage)}
                className="mt-3"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask AI Coach
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
