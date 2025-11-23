import { motion } from "framer-motion";
import { Zap, CheckCircle, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

interface CompetitorOfferCardProps {
  provider: string;
  planName: string | null;
  price: number;
  speed: string | null;
  features: any;
  userCurrentPrice: number | null;
  onGenerateScript: () => void;
}

export function CompetitorOfferCard({
  provider,
  planName,
  price,
  speed,
  features,
  userCurrentPrice,
  onGenerateScript,
}: CompetitorOfferCardProps) {
  const savings = userCurrentPrice ? userCurrentPrice - price : null;
  const savingsPercent = userCurrentPrice ? ((savings || 0) / userCurrentPrice) * 100 : 0;
  const isGoodDeal = savings && savings > 10;

  return (
    <GlassPanel
      className={cn(
        "relative p-6 transition-all",
        isGoodDeal && "border-warning/50"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        {/* Good Deal Badge */}
        {isGoodDeal && (
          <div className="absolute -top-3 -right-3 z-10">
            <Badge className="bg-warning text-black font-bold px-3 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              HOT DEAL
            </Badge>
          </div>
        )}

        {/* Provider Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{provider}</h3>
            {planName && <p className="text-sm text-muted-foreground">{planName}</p>}
          </div>
          {savings && savings > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-success">
                <TrendingDown className="w-4 h-4" />
                <span className="text-lg font-bold">${savings.toFixed(0)}</span>
              </div>
              <div className="text-xs text-muted-foreground">less/mo</div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-foreground">
            ${price.toFixed(2)}
            <span className="text-sm text-muted-foreground font-normal">/mo</span>
          </div>
          {speed && (
            <div className="text-sm text-muted-foreground mt-1">
              <Zap className="w-4 h-4 inline mr-1" />
              {speed}
            </div>
          )}
        </div>

        {/* Features */}
        {features && Object.keys(features).length > 0 && (
          <div className="space-y-2 mb-4">
            {Object.entries(features).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-muted-foreground">
                  {key.replace(/_/g, ' ')}: <span className="text-foreground">{String(value)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price Comparison Bar */}
        {userCurrentPrice && (
          <div className="mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={isGoodDeal ? 'bg-success h-full' : 'bg-accent h-full'}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, 100 - savingsPercent)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>This offer</span>
              <span>Your current: ${userCurrentPrice.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onGenerateScript}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Use This Leverage
        </Button>
      </motion.div>
    </GlassPanel>
  );
}