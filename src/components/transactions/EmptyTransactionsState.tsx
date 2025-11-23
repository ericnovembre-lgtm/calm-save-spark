import { motion } from "framer-motion";
import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

interface EmptyTransactionsStateProps {
  onAddTransaction?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyTransactionsState({
  onAddTransaction,
  hasFilters,
  onClearFilters,
}: EmptyTransactionsStateProps) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassPanel className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No transactions match your filters
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters to see more results
          </p>
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Clear All Filters
            </Button>
          )}
        </GlassPanel>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassPanel className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
          <Receipt className="w-10 h-10 text-accent" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          No transactions yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start tracking your finances by adding your first transaction or
          connecting your bank accounts
        </p>
        {onAddTransaction && (
          <Button onClick={onAddTransaction} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Transaction
          </Button>
        )}
      </GlassPanel>
    </motion.div>
  );
}
