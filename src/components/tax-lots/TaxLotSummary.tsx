import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Calendar, Scissors } from "lucide-react";
import { motion } from "framer-motion";

interface TaxLotSummaryProps {
  analytics: {
    totalUnrealizedGain: number;
    totalRealizedGain: number;
    shortTermCount: number;
    longTermCount: number;
    harvestCandidates: any[];
  };
}

export function TaxLotSummary({ analytics }: TaxLotSummaryProps) {
  const stats = [
    {
      label: 'Unrealized Gain/Loss',
      value: analytics.totalUnrealizedGain,
      icon: analytics.totalUnrealizedGain >= 0 ? TrendingUp : TrendingDown,
      color: analytics.totalUnrealizedGain >= 0 ? 'text-green-600' : 'text-red-500',
      format: (v: number) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toLocaleString()}`,
    },
    {
      label: 'Realized Gain/Loss',
      value: analytics.totalRealizedGain,
      icon: analytics.totalRealizedGain >= 0 ? TrendingUp : TrendingDown,
      color: analytics.totalRealizedGain >= 0 ? 'text-green-600' : 'text-red-500',
      format: (v: number) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toLocaleString()}`,
    },
    {
      label: 'Short-Term Lots',
      value: analytics.shortTermCount,
      icon: Clock,
      color: 'text-amber-500',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Long-Term Lots',
      value: analytics.longTermCount,
      icon: Calendar,
      color: 'text-green-600',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Harvest Candidates',
      value: analytics.harvestCandidates.length,
      icon: Scissors,
      color: 'text-amber-600',
      format: (v: number) => v.toString(),
    },
  ];

  const potentialTaxSavings = analytics.harvestCandidates.reduce((sum, lot) => {
    const loss = Math.abs(lot.unrealized_gain_loss || 0);
    // Estimate 25% tax rate for short term, 15% for long term
    const taxRate = lot.holding_period === 'short_term' ? 0.25 : 0.15;
    return sum + (loss * taxRate);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.format(stat.value)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {potentialTaxSavings > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scissors className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-foreground">Potential Tax Savings</p>
                  <p className="text-sm text-muted-foreground">
                    By harvesting {analytics.harvestCandidates.length} losing positions
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                ~${potentialTaxSavings.toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
