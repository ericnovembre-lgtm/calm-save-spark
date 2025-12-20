import { DashboardWidgetCard } from "@/components/dashboard/DashboardWidgetCard";
import { PiggyBank, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BudgetItem {
  category: string;
  spent: number;
  limit: number;
}

interface BudgetsWidgetProps {
  budgets?: BudgetItem[];
}

/**
 * Budgets Widget - Shows budget status and alerts
 * Part of Generative Dashboard
 */
export function BudgetsWidget({ budgets = [] }: BudgetsWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Show top 3 budgets or those exceeding 80%
  const displayBudgets = budgets
    .filter(b => b.spent / b.limit > 0.8)
    .slice(0, 3);

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const overallPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <DashboardWidgetCard className="h-full" lastUpdated="5m ago">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PiggyBank className="h-5 w-5 text-primary" />
        <span className="text-base font-medium text-foreground">Budget Status</span>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Overall</p>
            <motion.p 
              className={`text-lg font-bold ${overallPercent > 90 ? 'text-destructive' : 'text-foreground'}`}
              initial={prefersReducedMotion ? false : { scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {overallPercent.toFixed(0)}%
            </motion.p>
          </div>
          <Progress value={overallPercent} className="h-2" />
        </div>

        {displayBudgets.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border">
            {displayBudgets.map((budget, index) => {
              const percent = (budget.spent / budget.limit) * 100;
              const isOverBudget = percent > 100;
              
              return (
                <motion.div
                  key={budget.category}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-1">
                      {isOverBudget && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {budget.category}
                    </span>
                    <span className={`text-xs ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      ${budget.spent} / ${budget.limit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percent, 100)} 
                    className="h-1.5"
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {budgets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No budgets set up yet
          </p>
        )}
      </div>
    </DashboardWidgetCard>
  );
}
