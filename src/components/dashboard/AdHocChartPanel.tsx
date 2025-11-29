import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BarChart3, PieChart, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface AdHocChartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  isLoading?: boolean;
  chartType?: 'pie' | 'bar' | 'line' | 'comparison';
  data?: ChartData[];
  insight?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(var(--destructive))',
  'hsl(200, 88%, 40%)',
];

/**
 * Ad-Hoc Chart Panel
 * Renders AI-generated charts based on natural language queries
 */
export function AdHocChartPanel({
  isOpen,
  onClose,
  query,
  isLoading,
  chartType = 'bar',
  data = [],
  insight,
}: AdHocChartPanelProps) {
  const renderChart = () => {
    if (data.length === 0) return null;

    // Add colors to data
    const coloredData = data.map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length],
    }));

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie
                data={coloredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationDuration={800}
                animationBegin={200}
              >
                {coloredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
            </RechartsPie>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={coloredData}>
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      case 'comparison':
      default:
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={coloredData} layout="vertical">
              <XAxis
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
              >
                {coloredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            "bg-background/95 backdrop-blur-xl rounded-2xl",
            "border border-border/50 shadow-2xl overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Generated from:</p>
                <p className="text-sm font-medium text-foreground truncate max-w-xs">
                  "{query}"
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chart content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[250px] gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing your data...</p>
              </div>
            ) : (
              <>
                {renderChart()}

                {/* Legend */}
                {data.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {data.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.name}: <span className="font-medium text-foreground">${item.value.toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* AI Insight */}
          {insight && !isLoading && (
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
