import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Crown, Rocket, Building2 } from "lucide-react";

export interface TierInfo {
  name: string;
  minAmount: number;
  maxAmount: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export const PRICING_TIERS: TierInfo[] = [
  {
    name: "Starter",
    minAmount: 0,
    maxAmount: 3,
    color: "bg-secondary text-secondary-foreground",
    icon: <Sparkles className="w-3 h-3" />,
    description: "Essential savings features",
  },
  {
    name: "Enhanced",
    minAmount: 4,
    maxAmount: 7,
    color: "bg-primary/10 text-primary border-primary/20",
    icon: <Zap className="w-3 h-3" />,
    description: "Automated savings & insights",
  },
  {
    name: "Premium",
    minAmount: 8,
    maxAmount: 12,
    color: "bg-primary/20 text-primary border-primary/30",
    icon: <Crown className="w-3 h-3" />,
    description: "Unlimited goals & advanced features",
  },
  {
    name: "Advanced",
    minAmount: 13,
    maxAmount: 16,
    color: "bg-primary/30 text-primary border-primary/40",
    icon: <Rocket className="w-3 h-3" />,
    description: "AI forecasting & custom automation",
  },
  {
    name: "Enterprise",
    minAmount: 17,
    maxAmount: 20,
    color: "bg-primary text-primary-foreground",
    icon: <Building2 className="w-3 h-3" />,
    description: "White-label & API access",
  },
];

export function getTierForAmount(amount: number): TierInfo {
  return PRICING_TIERS.find(
    (tier) => amount >= tier.minAmount && amount <= tier.maxAmount
  ) || PRICING_TIERS[0];
}

interface TierBadgeProps {
  amount: number;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ 
  amount, 
  showDescription = false,
  size = "md" 
}: TierBadgeProps) {
  const tier = getTierForAmount(amount);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${tier.color} ${sizeClasses[size]} flex items-center gap-1.5 font-semibold`}
      >
        {tier.icon}
        {tier.name}
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground">
          {tier.description}
        </span>
      )}
    </div>
  );
}
