import { motion } from 'framer-motion';
import { BudgetCard } from './BudgetCard';
import { useMemo, useEffect } from 'react';
import { useBudgetDragToRebalance } from '@/hooks/useBudgetDragToRebalance';
import { FundTransferParticles } from './FundTransferParticles';

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
  const {
    dragState,
    dropZones,
    showParticles,
    startDrag,
    updateDragPosition,
    endDrag,
    registerDropZone,
    unregisterDropZone
  } = useBudgetDragToRebalance(() => {
    // Refresh data after transfer
    window.location.reload();
  });
  
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

  // Register/unregister drop zones
  useEffect(() => {
    prioritizedBudgets.forEach(budget => {
      const spend = spending[budget.id];
      const spentAmount = spend?.spent_amount || 0;
      const totalLimit = parseFloat(String(budget.total_limit));
      const remaining = totalLimit - spentAmount;
      const percentage = totalLimit > 0 ? (spentAmount / totalLimit) * 100 : 0;
      
      // Valid drop target = has shortage (>80% spent or over budget) and is not paused
      const isValid = percentage >= 80 && budget.is_active;
      
      registerDropZone(budget.id, isValid);
    });

    return () => {
      prioritizedBudgets.forEach(budget => {
        unregisterDropZone(budget.id);
      });
    };
  }, [prioritizedBudgets, spending, registerDropZone, unregisterDropZone]);

  return (
    <>
      {/* Particle animation overlay */}
      {showParticles && (
        <FundTransferParticles
          from={showParticles.from}
          to={showParticles.to}
          amount={showParticles.amount}
        />
      )}

      {/* Ghost card preview during drag */}
      {dragState?.isDragging && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragState.dragPosition.x,
            top: dragState.dragPosition.y,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 0.7, opacity: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-emerald-400">
            <div className="font-bold text-xl">${dragState.surplus.toFixed(2)}</div>
            <div className="text-xs opacity-90">{dragState.sourceName}</div>
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
        {prioritizedBudgets.map((budget, index) => {
          const categoryData = getCategoryData(budget);
          const spend = spending[budget.id];
          const spentAmount = spend?.spent_amount || 0;
          const totalLimit = parseFloat(String(budget.total_limit));
          const remaining = totalLimit - spentAmount;
          
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
                dragState={dragState}
                dropZoneState={dropZones.get(budget.id)}
                onDragStart={(element) => startDrag(budget.id, budget.name, remaining, element)}
                onDragMove={updateDragPosition}
                onDragEnd={endDrag}
              />
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
