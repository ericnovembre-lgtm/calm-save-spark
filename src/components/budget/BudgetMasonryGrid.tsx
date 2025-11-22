import { motion } from 'framer-motion';
import { BudgetCard } from './BudgetCard';
import { useMemo } from 'react';

type Priority = 'hero' | 'large' | 'normal';

interface BudgetMasonryGridProps {
  budgets: any[];
  spending: Record<string, any>;
  categories: any[];
  onEdit: (budgetId: string) => void;
  onDelete: (budgetId: string) => Promise<void>;
}

export function BudgetMasonryGrid({
  budgets,
  spending,
  categories,
  onEdit,
  onDelete
}: BudgetMasonryGridProps) {
  
  // Sort and assign priority to budgets
  const prioritizedBudgets = useMemo(() => {
    return budgets.map(budget => {
      const spend = spending[budget.id];
      const spentAmount = spend?.spent_amount || 0;
      const totalLimit = parseFloat(String(budget.total_limit));
      const percentage = totalLimit > 0 ? (spentAmount / totalLimit) * 100 : 0;

      let priority: Priority = 'normal';
      if (percentage >= 100) {
        priority = 'hero'; // Critical - over budget
      } else if (percentage >= 80) {
        priority = 'large'; // Warning
      }

      return {
        ...budget,
        priority,
        percentage,
        sortOrder: 
          percentage >= 100 ? 0 : // Critical first
          percentage >= 80 ? 1 :  // Warning second
          2                        // Normal last
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [budgets, spending]);

  const getCategoryData = (budget: any) => {
    const categoryCode = Object.keys(budget.category_limits || {})[0];
    return categories.find(c => c.code === categoryCode);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
      {prioritizedBudgets.map((budget, index) => {
        const categoryData = getCategoryData(budget);
        
        // Hero items span full width
        const colSpan = budget.priority === 'hero' 
          ? 'md:col-span-2 lg:col-span-3' 
          : budget.priority === 'large'
          ? 'lg:col-span-2'
          : '';

        return (
          <motion.div
            key={budget.id}
            className={colSpan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            <BudgetCard
              budget={budget}
              spending={spending[budget.id]}
              categoryData={categoryData}
              onEdit={() => onEdit(budget.id)}
              onDelete={() => onDelete(budget.id)}
              size={budget.priority}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
