import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type RedemptionCatalog = Database['public']['Tables']['redemption_catalog']['Row'];

interface RedemptionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RedemptionCatalog;
  currentPoints: number;
  onConfirm: () => void;
  isRedeeming: boolean;
}

export function RedemptionConfirmDialog({
  open,
  onOpenChange,
  item,
  currentPoints,
  onConfirm,
  isRedeeming,
}: RedemptionConfirmDialogProps) {
  const remainingPoints = currentPoints - item.points_cost;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Confirm Redemption
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review your redemption details before confirming
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Details */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-semibold mb-2">{item.name}</h4>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Value</span>
              <span className="font-bold text-lg">${item.dollar_value}</span>
            </div>
          </div>

          {/* Points Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Points</span>
              <span className="font-medium">{currentPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Points Cost</span>
              <span className="font-medium text-red-600">-{item.points_cost.toLocaleString()}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-medium">Remaining Points</span>
              <span className="font-bold text-primary">{remainingPoints.toLocaleString()}</span>
            </div>
          </div>

          {/* Warning if low points */}
          {remainingPoints < 1000 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                This will leave you with fewer than 1,000 points
              </p>
            </motion.div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRedeeming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isRedeeming}
            className="gap-2"
          >
            {isRedeeming ? (
              <>Processing...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Confirm Redemption
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
