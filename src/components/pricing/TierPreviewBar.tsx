import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

interface TierPreviewBarProps {
  selectedAmount: number;
}

export default function TierPreviewBar({ selectedAmount }: TierPreviewBarProps) {
  const tiers = [
    { price: 0, label: "Free", features: 3, color: "text-muted-foreground" },
    { price: 5, label: "Starter", features: 5, color: "text-primary" },
    { price: 10, label: "Pro", features: 10, color: "text-primary" },
    { price: 15, label: "Advanced", features: 15, color: "text-primary" },
    { price: 20, label: "Enterprise", features: 20, color: "text-primary" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-2">
        {tiers.map((tier) => {
          const isActive = selectedAmount >= tier.price;
          const isCurrent = 
            selectedAmount >= tier.price && 
            (tier.price === 20 || selectedAmount < tiers[tiers.indexOf(tier) + 1]?.price);

          return (
            <div
              key={tier.price}
              className={`flex-1 text-center transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className="relative">
                <div
                  className={`text-xs font-medium mb-1 transition-colors ${
                    isCurrent ? tier.color : "text-muted-foreground"
                  }`}
                >
                  {tier.label}
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 bg-primary ${
                      isCurrent ? "opacity-100" : "opacity-50"
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: isActive ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {isActive ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {tier.features === 0 
                      ? "3 free" 
                      : `${tier.features} features`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{selectedAmount === 0 ? 3 : selectedAmount}</strong> of{" "}
          {FREEMIUM_FEATURE_ORDER.length} features unlocked
        </p>
      </div>
    </div>
  );
}
