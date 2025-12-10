import { motion } from 'framer-motion';
import { Receipt, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { SplitExpense } from '@/hooks/useSplitGroups';

interface ExpenseListProps {
  expenses: SplitExpense[];
  currentUserId?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  general: '📦',
  food: '🍽️',
  transport: '🚗',
  utilities: '💡',
  rent: '🏠',
  entertainment: '🎬',
  shopping: '🛍️',
  travel: '✈️',
};

export function ExpenseList({ expenses, currentUserId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">No expenses yet</p>
        <p className="text-sm text-muted-foreground/70">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => {
        const isPaidByMe = expense.paid_by === currentUserId;
        const icon = CATEGORY_ICONS[expense.category] || '📦';

        return (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{expense.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>{isPaidByMe ? 'You paid' : 'Someone paid'}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-foreground">
                ${Number(expense.total_amount).toFixed(2)}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {expense.is_settled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    Settled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
