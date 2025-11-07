import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Check, X } from "lucide-react";
import { getTierForAmount } from "./TierBadge";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";

interface TierInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAmount: number;
  clickedAmount: number;
  onDowngrade?: () => void;
}

export default function TierInfoModal({
  open,
  onOpenChange,
  currentAmount,
  clickedAmount,
  onDowngrade,
}: TierInfoModalProps) {
  const currentTier = getTierForAmount(currentAmount);
  const clickedTier = getTierForAmount(clickedAmount);
  const isCurrentTier = currentAmount === clickedAmount;
  const isDowngrade = clickedAmount < currentAmount;

  const currentFeatures = FREEMIUM_FEATURE_ORDER.slice(0, currentAmount);
  const featuresToLose = isDowngrade
    ? FREEMIUM_FEATURE_ORDER.slice(clickedAmount, currentAmount)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCurrentTier ? (
              <>
                <Info className="w-5 h-5 text-primary" />
                You're Already Here
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Downgrade Preview
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCurrentTier
              ? `You're currently on the ${currentTier.name} tier with ${currentAmount} feature${currentAmount === 1 ? '' : 's'} unlocked.`
              : `Downgrading from ${currentTier.name} to ${clickedTier.name} will affect your access.`}
          </DialogDescription>
        </DialogHeader>

        {isCurrentTier ? (
          <div className="space-y-3 py-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{currentTier.name}</span>
                <Badge variant="secondary">${currentAmount}/month</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTier.description}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Your Features:</p>
              {currentFeatures.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-start gap-2 text-sm"
                >
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium mb-2">
                You'll lose access to {featuresToLose.length} feature
                {featuresToLose.length === 1 ? '' : 's'}:
              </p>
              <div className="space-y-2">
                {featuresToLose.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">
                        {feature.name}
                      </div>
                      <div className="text-xs">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">You'll keep:</p>
              <p className="text-sm text-muted-foreground">
                {clickedAmount} feature{clickedAmount === 1 ? '' : 's'} from the {clickedTier.name} tier
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {isCurrentTier ? (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Got It
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onDowngrade}
                className="flex-1"
              >
                Proceed with Downgrade
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
