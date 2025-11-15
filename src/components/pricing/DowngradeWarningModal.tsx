import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";

interface DowngradeWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentAmount: number;
  targetAmount: number;
}

export default function DowngradeWarningModal({
  open,
  onClose,
  onConfirm,
  currentAmount,
  targetAmount,
}: DowngradeWarningModalProps) {
  const featuresToLose = FREEMIUM_FEATURE_ORDER.slice(targetAmount, currentAmount);
  const monthlySavings = currentAmount - targetAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>Downgrade Warning</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-4">
            You're about to downgrade from <strong>${currentAmount}/month</strong> to{" "}
            <strong>${targetAmount}/month</strong>, saving ${monthlySavings}/month.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-3">
            You'll lose access to these {featuresToLose.length} feature{featuresToLose.length !== 1 ? 's' : ''}:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {featuresToLose.map((feature, index) => (
              <div
                key={feature.key}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border"
              >
                <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
            Confirm Downgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
