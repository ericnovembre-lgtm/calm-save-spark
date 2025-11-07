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
import { Check, CreditCard, Shield, Zap, Sparkles } from "lucide-react";
import { getTierForAmount } from "./TierBadge";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";

interface CheckoutConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAmount: number;
  currentAmount: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function CheckoutConfirmationModal({
  open,
  onOpenChange,
  selectedAmount,
  currentAmount,
  onConfirm,
  loading = false,
}: CheckoutConfirmationModalProps) {
  const tier = getTierForAmount(selectedAmount);
  const features = FREEMIUM_FEATURE_ORDER.slice(0, selectedAmount);
  const newFeatures = FREEMIUM_FEATURE_ORDER.slice(currentAmount, selectedAmount);
  const isUpgrade = selectedAmount > currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Confirm Your Subscription
          </DialogTitle>
          <DialogDescription>
            Review your plan details before proceeding to payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tier Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-lg">{tier.name}</div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${selectedAmount}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>
          </div>

          {/* New Features Unlocking */}
          {isUpgrade && newFeatures.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Unlocking {newFeatures.length} New Feature{newFeatures.length === 1 ? '' : 's'}:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newFeatures.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-start gap-2 p-2 bg-muted/50 rounded"
                  >
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Features Summary */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">{features.length} feature{features.length === 1 ? '' : 's'}</span> included
            </p>
          </div>

          {/* Trial & Terms */}
          <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">14-Day Free Trial Included</p>
              <p className="text-muted-foreground text-xs">
                You won't be charged until the trial ends. Cancel anytime without penalty.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
