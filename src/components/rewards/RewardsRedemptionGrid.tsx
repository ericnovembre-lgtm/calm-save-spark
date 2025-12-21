import { useState } from "react";
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
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface RedemptionOption {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  value: string;
  icon: LucideIcon;
  category: "cashback" | "giftcard" | "travel" | "shopping";
  popular?: boolean;
}

const redemptionOptions: RedemptionOption[] = [
  {
    id: "cashback-25",
    name: "Cash Back",
    description: "Direct deposit to your account",
    pointsCost: 2500,
    value: "$25",
    icon: DollarSign,
    category: "cashback",
    popular: true,
  },
  {
    id: "cashback-50",
    name: "Cash Back",
    description: "Direct deposit to your account",
    pointsCost: 5000,
    value: "$50",
    icon: DollarSign,
    category: "cashback",
  },
  {
    id: "amazon-25",
    name: "Amazon Gift Card",
    description: "Shop millions of products",
    pointsCost: 2500,
    value: "$25",
    icon: ShoppingBag,
    category: "giftcard",
    popular: true,
  },
  {
    id: "starbucks-10",
    name: "Starbucks",
    description: "Coffee & treats",
    pointsCost: 1000,
    value: "$10",
    icon: Coffee,
    category: "giftcard",
  },
  {
    id: "travel-100",
    name: "Travel Credit",
    description: "Book flights or hotels",
    pointsCost: 8000,
    value: "$100",
    icon: Plane,
    category: "travel",
  },
  {
    id: "charity-25",
    name: "Donate to Charity",
    description: "Support a cause you care about",
    pointsCost: 2500,
    value: "$25",
    icon: Gift,
    category: "shopping",
  },
];

interface RewardsRedemptionGridProps {
  availablePoints?: number;
}

export function RewardsRedemptionGrid({ availablePoints = 12450 }: RewardsRedemptionGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (option: RedemptionOption) => {
    if (availablePoints < option.pointsCost) {
      toast.error("Not enough points", {
        description: `You need ${(option.pointsCost - availablePoints).toLocaleString()} more points.`,
      });
      return;
    }

    setRedeeming(option.id);
    
    // Simulate redemption
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Redemption successful!", {
      description: `You've redeemed ${option.value} ${option.name}.`,
    });
    
    setRedeeming(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {redemptionOptions.map((option, index) => {
          const Icon = option.icon;
          const canAfford = availablePoints >= option.pointsCost;
          const isRedeeming = redeeming === option.id;

          return (
            <motion.div
              key={option.id}
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
                  {option.popular && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{option.value}</span>
                    <span className="text-sm text-muted-foreground">{option.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Cost</span>
                    <span className="font-semibold text-foreground">
                      {option.pointsCost.toLocaleString()} pts
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    variant={canAfford ? "default" : "secondary"}
                    disabled={!canAfford || isRedeeming}
                    onClick={() => handleRedeem(option)}
                  >
                    {isRedeeming ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
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
