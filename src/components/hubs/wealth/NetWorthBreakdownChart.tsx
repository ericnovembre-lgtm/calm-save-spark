import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LazyPieChart, Pie, Cell, Tooltip, Legend } from "@/components/charts/LazyPieChart";
import { useNetWorthBreakdown } from "@/hooks/useNetWorthBreakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ChartWrapper } from "@/components/ui/chart-wrapper";

export function NetWorthBreakdownChart() {
  const { data, isLoading } = useNetWorthBreakdown();
  const prefersReducedMotion = useReducedMotion();

  if (isLoading || !data) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const { assets, liabilities, totalAssets, totalLiabilities, netWorth } = data;

  return (
    <ChartWrapper delay={0.3}>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Net Worth Breakdown</h2>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Net Worth</div>
            <div className="text-2xl font-bold text-foreground">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Assets Chart */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Assets</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {assets.length > 0 ? (
              <>
                <LazyPieChart height={280}>
                  <Pie
                    data={assets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${((entry.value / totalAssets) * 100).toFixed(1)}%`}
                  >
                    {assets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                </LazyPieChart>

                <div className="mt-4 space-y-2">
                  {assets.map((asset, idx) => (
                    <motion.div
                      key={idx}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-sm text-foreground">{asset.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No assets to display
              </div>
            )}
          </div>

          {/* Liabilities Chart */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Liabilities</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                ${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {liabilities.length > 0 ? (
              <>
                <LazyPieChart height={280}>
                  <Pie
                    data={liabilities}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${((entry.value / totalLiabilities) * 100).toFixed(1)}%`}
                  >
                    {liabilities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                </LazyPieChart>

                <div className="mt-4 space-y-2">
                  {liabilities.map((liability, idx) => (
                    <motion.div
                      key={idx}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: liability.color }} />
                        <span className="text-sm text-foreground">{liability.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        ${liability.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No liabilities to display
              </div>
            )}
          </div>
        </div>
      </div>
    </ChartWrapper>
  );
}
