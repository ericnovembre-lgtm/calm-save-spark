import { Card } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetWorthDataPoint {
  date: string;
  actual?: number;
  projected?: number;
  milestone?: string;
}

interface NetWorthTimelineProps {
  historicalData: NetWorthDataPoint[];
  projectedData: NetWorthDataPoint[];
  title?: string;
  currentNetWorth?: number;
}

export function NetWorthTimeline({
  historicalData,
  projectedData,
  title = "Net Worth Journey",
  currentNetWorth,
}: NetWorthTimelineProps) {
  // Combine and sort data
  const allData = [...historicalData, ...projectedData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const currentValue = currentNetWorth || historicalData[historicalData.length - 1]?.actual || 0;
  const projectedFuture = projectedData[projectedData.length - 1]?.projected || 0;
  const growthRate = currentValue > 0 
    ? ((projectedFuture - currentValue) / currentValue * 100).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Historical progress and future projections
              </p>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Current Net Worth
              </span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(currentValue)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Projected Growth
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              +{growthRate}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={allData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                tickFormatter={formatDate}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelFormatter={formatDate}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'actual' ? 'Historical' : 'Projected',
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#actualGradient)"
                animationDuration={800}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#projectedGradient)"
                animationDuration={800}
                dot={{ r: 3, fill: 'hsl(var(--accent))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Milestones */}
        {allData.some(d => d.milestone) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Key Milestones
            </h4>
            <div className="space-y-2">
              {allData
                .filter(d => d.milestone)
                .map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{point.milestone}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(point.date)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {formatCurrency(point.actual || point.projected || 0)}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-accent border-2 border-dashed" />
            <span className="text-xs text-muted-foreground">Projected</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
