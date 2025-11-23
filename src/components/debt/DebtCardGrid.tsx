import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DebtCard from './DebtCard';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];
type DebtPayment = Database['public']['Tables']['debt_payment_history']['Row'];

interface DebtCardGridProps {
  debts: Debt[];
  payments: DebtPayment[];
  strategy: 'avalanche' | 'snowball';
  onUpdate: (debtId: string, updates: any) => void;
  onDelete: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
}

export function DebtCardGrid({ 
  debts, 
  payments, 
  strategy, 
  onUpdate, 
  onDelete, 
  onEdit 
}: DebtCardGridProps) {
  // Sort debts based on strategy
  const sortedDebts = useMemo(() => {
    const debtsCopy = [...debts];
    
    if (strategy === 'avalanche') {
      // Highest interest rate first
      return debtsCopy.sort((a, b) => b.interest_rate - a.interest_rate);
    } else {
      // Smallest balance first
      return debtsCopy.sort((a, b) => a.current_balance - b.current_balance);
    }
  }, [debts, strategy]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {sortedDebts.map((debt) => (
          <motion.div
            key={debt.id}
            layoutId={debt.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300 
            }}
          >
            <DebtCard
              debt={debt}
              payments={payments.filter(p => p.debt_id === debt.id)}
              onUpdate={(updates) => onUpdate(debt.id, updates)}
              onDelete={() => onDelete(debt)}
              onEdit={() => onEdit(debt)}
              strategy={strategy}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
