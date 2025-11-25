import { motion } from "framer-motion";
import { MapPin, DollarSign, ShoppingBag } from "lucide-react";
import type { MerchantLocation } from "@/hooks/useMerchantLocations";

interface MerchantMarkerPopupProps {
  location: MerchantLocation;
}

export function MerchantMarkerPopup({ location }: MerchantMarkerPopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-xl min-w-[200px]"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm text-foreground">
            {location.merchant}
          </h3>
          
          {location.city && location.state && (
            <p className="text-xs text-muted-foreground">
              {location.city}, {location.state}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-accent" />
              <span className="font-medium text-foreground">
                ${location.totalSpent.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {location.transactionCount} txn{location.transactionCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {location.category && (
            <div className="mt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {location.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
