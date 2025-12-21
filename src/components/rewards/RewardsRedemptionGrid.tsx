import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Gift, 
  Plane, 
  ShoppingBag, 
  Coffee, 
  Sparkles,
  Check,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePointsRedemption } from "@/hooks/usePointsRedemption";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  cashback: DollarSign,
  gift_card: ShoppingBag,
  travel: Plane,
  statement_credit: DollarSign,
  donation: Gift,
  merchandise: Gift,
};

const categoryLabels: Record<string, string> = {
  cashback: "Cashback",
  gift_card: "Gift Card",
  travel: "Travel",
  statement_credit: "Statement Credit",
  donation: "Donation",
  merchandise: "Merchandise",
};

interface RewardsRedemptionGridProps {
  availablePoints?: number;
}

export function RewardsRedemptionGrid({ availablePoints = 0 }: RewardsRedemptionGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const { catalog, isLoadingCatalog, redeem, isRedeeming } = usePointsRedemption();

  if (isLoadingCatalog) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  // If no catalog items, show placeholder
  if (catalog.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Rewards Available</h3>
        <p className="text-muted-foreground">Check back soon for exciting redemption options!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalog.map((item, index) => {
          const Icon = iconMap[item.redemption_type] || Gift;
          const canAfford = availablePoints >= item.points_cost;

          return (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className={`p-5 h-full flex flex-col transition-all hover:shadow-lg ${
                canAfford 
                  ? "border-border/50 hover:border-accent/30" 
                  : "opacity-60 border-border/30"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-accent/10">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  {item.min_points === 0 && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${item.dollar_value.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description || categoryLabels[item.redemption_type] || item.redemption_type}
                  </p>
                  {item.partner_name && (
                    <Badge variant="outline" className="text-xs">
                      {item.partner_name}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Cost</span>
                    <span className="font-semibold text-foreground">
                      {item.points_cost.toLocaleString()} pts
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    variant={canAfford ? "default" : "secondary"}
                    disabled={!canAfford || isRedeeming}
                    onClick={() => redeem(item.id)}
                  >
                    {isRedeeming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : canAfford ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Redeem
                      </>
                    ) : (
                      "Not enough points"
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
