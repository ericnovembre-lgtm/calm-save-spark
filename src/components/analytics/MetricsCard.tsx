import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TrendSparkline } from "@/components/dashboard/TrendSparkline";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: number[];
  icon: LucideIcon;
  color?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'text-primary',
  format = 'number'
}: MetricsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return typeof val === 'number' ? `$${val.toLocaleString()}` : val;
    }
    if (format === 'percentage') {
      return typeof val === 'number' ? `${val}%` : val;
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">
              {formatValue(value)}
            </h3>
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            color.replace('text-', 'bg-') + '/10'
          )}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
        </div>

        {/* Change Indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                isPositive && "bg-green-500/10 text-green-600",
                isNegative && "bg-red-500/10 text-red-600"
              )}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
            </motion.div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}

        {/* Mini Sparkline */}
        {trend && trend.length > 0 && (
          <div className="h-12">
            <TrendSparkline data={trend} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
