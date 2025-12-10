import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight, Plus } from 'lucide-react';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BeliefInventoryProps {
  onAddNew?: () => void;
}

export function BeliefInventory({ onAddNew }: BeliefInventoryProps) {
  const { entriesByType, isLoading } = useMoneyMindset();
  const beliefs = entriesByType['belief'] || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Money Beliefs</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddNew}>
          <Plus className="w-4 h-4 mr-1" />
          Add Belief
        </Button>
      </div>

      {beliefs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No money beliefs recorded yet</p>
          <p className="text-sm">Start documenting your beliefs about money</p>
        </div>
      ) : (
        <div className="space-y-2">
          {beliefs.slice(0, 5).map((belief, index) => (
            <motion.div
              key={belief.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{belief.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{belief.content}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
