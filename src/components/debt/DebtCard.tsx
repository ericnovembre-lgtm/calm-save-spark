import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, DollarSign, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtPayment = Database['public']['Tables']['debt_payment_history']['Row'];

interface DebtCardProps {
  debt: Debt;
  payments: DebtPayment[];
  onUpdate: (updates: Partial<Debt>) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function DebtCard({ debt, payments, onUpdate, onDelete, onEdit }: DebtCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const progress = debt.original_balance 
    ? ((Number(debt.original_balance) - Number(debt.current_balance)) / Number(debt.original_balance)) * 100 
    : 0;

  const debtTypeColors: Record<string, string> = {
    credit_card: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    student_loan: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    mortgage: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    personal_loan: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    auto_loan: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const recentPayments = payments.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-background border border-border hover:border-primary/50 transition-all">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{debt.debt_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${debtTypeColors[debt.debt_type] || debtTypeColors.other}`}>
                  {debt.debt_type.replace('_', ' ')}
                </span>
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
              <span className="text-sm text-muted-foreground">Current Balance</span>
              <span className="text-2xl font-bold text-foreground">
                ${Number(debt.current_balance).toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress.toFixed(1)}% paid off
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Interest</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{debt.interest_rate}%</p>
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
      </Card>
    </motion.div>
  );
}
