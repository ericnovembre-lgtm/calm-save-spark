import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";
import { getTierForAmount } from "./TierBadge";

interface TierUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAmount: number;
  targetAmount: number;
  onConfirm: () => void;
}

export default function TierUpgradeModal({
  open,
  onOpenChange,
  currentAmount,
  targetAmount,
  onConfirm,
}: TierUpgradeModalProps) {
  const currentTier = getTierForAmount(currentAmount);
  const targetTier = getTierForAmount(targetAmount);
  
  const currentFeatures = FREEMIUM_FEATURE_ORDER.slice(0, currentAmount);
  const newFeatures = FREEMIUM_FEATURE_ORDER.slice(currentAmount, targetAmount);
  const additionalCost = targetAmount - currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            See what's included when you upgrade from {currentTier.name} to {targetTier.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tier Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                {currentTier.icon}
                <span className="font-semibold">{currentTier.name}</span>
              </div>
              <div className="text-2xl font-bold">${currentAmount}/mo</div>
              <div className="text-sm text-muted-foreground mt-1">
                {currentAmount} features
              </div>
            </div>
            
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                {targetTier.icon}
                <span className="font-semibold">{targetTier.name}</span>
                <Badge variant="default" className="ml-auto">Upgrade</Badge>
              </div>
              <div className="text-2xl font-bold text-primary">${targetAmount}/mo</div>
              <div className="text-sm text-muted-foreground mt-1">
                {targetAmount} features (+{additionalCost})
              </div>
            </div>
          </div>
          
          {/* Current Features */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              You Already Have ({currentFeatures.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentFeatures.map((feature) => (
                <div key={feature.key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{feature.name}</div>
                    <div className="text-xs">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* New Features */}
          <div className="bg-primary/5 -mx-6 px-6 py-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              New Features You'll Unlock ({newFeatures.length})
            </h3>
            <div className="space-y-3">
              {newFeatures.map((feature, index) => (
                <div key={feature.key} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-primary/20">
                  <Badge variant="outline" className="mt-0.5">
                    ${currentAmount + index + 1}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={onConfirm} className="flex-1" size="lg">
              Upgrade to {targetTier.name} for ${targetAmount}/mo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
