import { Card } from "@/components/ui/card";
import { LazyPieChart, Pie, Cell, Tooltip } from "@/components/charts/LazyPieChart";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
  isLoading?: boolean;
  onCategoryClick?: (category: string) => void;
}

export function CategoryBreakdownChart({ 
  data, 
  isLoading,
  onCategoryClick 
}: CategoryBreakdownChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-md" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Category Breakdown</h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No category data available</p>
        </div>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Category Breakdown</h3>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <LazyPieChart height={280}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category"
                animationDuration={prefersReducedMotion ? 0 : 800}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(entry) => onCategoryClick?.(entry.category)}
                style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                    stroke={activeIndex === index ? 'hsl(var(--foreground))' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
            </LazyPieChart>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {data.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.category}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onCategoryClick?.(item.category)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">
                    ${item.amount.toFixed(0)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
            {data.length > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{data.length - 6} more categories
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
