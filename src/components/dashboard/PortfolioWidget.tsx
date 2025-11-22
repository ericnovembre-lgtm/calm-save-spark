import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PortfolioWidgetProps {
  totalValue?: number;
  costBasis?: number;
  marketChange?: number;
}

/**
 * Portfolio Widget - Shows investment portfolio performance
 * Part of Generative Dashboard
 */
export function PortfolioWidget({ 
  totalValue = 0, 
  costBasis = 0,
  marketChange = 0 
}: PortfolioWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const changePercent = costBasis > 0 ? ((totalValue - costBasis) / costBasis) * 100 : 0;
  const isPositive = changePercent >= 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Investment Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Value</p>
          <motion.p 
            className="text-3xl font-bold"
            initial={prefersReducedMotion ? false : { scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ${totalValue.toLocaleString()}
          </motion.p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            <span className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isPositive ? 'gain' : 'loss'}
          </div>
        </div>

        {marketChange !== 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">Market Change Today</p>
            <p className={`text-sm font-medium ${marketChange > 0 ? 'text-success' : 'text-destructive'}`}>
              {marketChange > 0 ? '+' : ''}{marketChange.toFixed(2)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
