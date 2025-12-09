import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, DollarSign, TrendingDown, Calendar, ChevronDown, ChevronUp, Flame, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { DebtNegotiationScriptModal } from './DebtNegotiationScriptModal';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtPayment = Database['public']['Tables']['debt_payment_history']['Row'];

interface DebtCardProps {
  debt: Debt;
  payments: DebtPayment[];
  onUpdate: (updates: Partial<Debt>) => void;
  onDelete: () => void;
  onEdit: () => void;
  strategy?: 'avalanche' | 'snowball';
}

export default function DebtCard({ debt, payments, onUpdate, onDelete, onEdit, strategy }: DebtCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showGhostBar, setShowGhostBar] = useState(false);
  const [extraAmount, setExtraAmount] = useState(100);
  const [hasTriggeredVictory, setHasTriggeredVictory] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);

  // Depleting progress (starts at 100%, goes to 0%)
  const depletingProgress = debt.original_balance 
    ? (Number(debt.current_balance) / Number(debt.original_balance)) * 100 
    : 0;

  // Ghost bar preview calculation
  const ghostProgress = useMemo(() => {
    const newBalance = Math.max(0, debt.current_balance - extraAmount);
    return debt.original_balance 
      ? (newBalance / Number(debt.original_balance)) * 100
      : 0;
  }, [debt, extraAmount]);

  // High interest detection
  const isHighInterest = debt.interest_rate > 20;

  // Victory animation trigger
  useEffect(() => {
    if (debt.current_balance === 0 && !hasTriggeredVictory) {
      // Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Haptic
      haptics.achievementUnlocked();
      
      setHasTriggeredVictory(true);
    }
  }, [debt.current_balance, hasTriggeredVictory]);

  const debtTypeColors: Record<string, string> = {
    credit_card: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    student_loan: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    mortgage: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    personal_loan: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    auto_loan: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const recentPayments = payments.slice(0, 3);

  return (
    <AnimatePresence>
      {debt.current_balance > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            rotate: [0, -5, 5, -5, 5, 0],
            transition: {
              duration: 0.6,
              ease: 'easeInOut'
            }
          }}
          whileHover={{ y: -4, boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className={cn(
              'p-6 bg-background transition-all',
              isHighInterest 
                ? 'border-2 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                : 'border border-border hover:border-primary/50'
            )}
          >
            <motion.div
              animate={isHighInterest ? {
                boxShadow: [
                  '0 0 20px rgba(239,68,68,0.4)',
                  '0 0 40px rgba(239,68,68,0.6)',
                  '0 0 20px rgba(239,68,68,0.4)'
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{debt.debt_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${debtTypeColors[debt.debt_type] || debtTypeColors.other}`}>
                        {debt.debt_type.replace('_', ' ')}
                      </span>
                      {isHighInterest && (
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive"
                        >
                          <Flame className="w-3 h-3" />
                          High Interest
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit debt">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete debt">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Balance Remaining</span>
                    <span className="text-2xl font-bold text-foreground">
                      ${Number(debt.current_balance).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Depleting Progress Bar with Ghost Preview */}
                  <div className="relative">
                    <Progress value={depletingProgress} className="h-2" />
                    
                    {/* Ghost Bar */}
                    <AnimatePresence>
                      {showGhostBar && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 pointer-events-none"
                        >
                          <div className="relative h-2 w-full rounded-full overflow-hidden bg-transparent">
                            <motion.div
                              className="absolute inset-0 bg-emerald-500/40 rounded-full"
                              initial={{ width: `${depletingProgress}%` }}
                              animate={{ width: `${ghostProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {depletingProgress.toFixed(1)}% remaining
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Interest</span>
                    </div>
                    <p className={cn(
                      "text-sm font-semibold",
                      isHighInterest ? "text-destructive" : "text-foreground"
                    )}>
                      {debt.interest_rate}%
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Min Pay</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">${Number(debt.minimum_payment).toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Actual</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      ${Number(debt.actual_payment || debt.minimum_payment).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* APR Crusher - Negotiate Rate Button */}
                {isHighInterest && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={() => setShowNegotiationModal(true)}
                      className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                    >
                      <Flame className="w-4 h-4" />
                      Negotiate Rate
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Pay Extra Button with Ghost Bar */}
                <div
                  onMouseEnter={() => setShowGhostBar(true)}
                  onMouseLeave={() => setShowGhostBar(false)}
                  className="relative"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={onEdit}
                  >
                    <DollarSign className="w-4 h-4" />
                    Pay Extra
                  </Button>

                  {/* Ghost Bar Tooltip */}
                  <AnimatePresence>
                    {showGhostBar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 -top-24 z-10 p-3 rounded-lg bg-popover border border-border shadow-lg"
                      >
                        <p className="text-xs text-muted-foreground mb-2">
                          Preview extra payment impact:
                        </p>
                        <Slider
                          value={[extraAmount]}
                          onValueChange={(v) => setExtraAmount(v[0])}
                          max={Math.min(debt.current_balance, 500)}
                          step={25}
                          className="mb-2"
                        />
                        <p className="text-sm font-semibold text-emerald-500">
                          Paying ${extraAmount} extra reduces balance to ${(debt.current_balance - extraAmount).toFixed(2)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Details Toggle */}
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <span className="text-sm">Recent Payments</span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {/* Expandable Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-2 border-t border-border">
                        {recentPayments.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
                        ) : (
                          recentPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                              </span>
                              <span className="font-medium text-foreground">
                                ${Number(payment.amount).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Card>

          {/* Debt Negotiation Script Modal */}
          <DebtNegotiationScriptModal
            debt={debt}
            open={showNegotiationModal}
            onOpenChange={setShowNegotiationModal}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
