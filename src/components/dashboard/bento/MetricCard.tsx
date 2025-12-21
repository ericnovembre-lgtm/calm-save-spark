/**
 * MetricCard - Key metrics display with trend indicators
 * Shows large number, label, icon, and percentage change badge
 */

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard } from "./BentoCard";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { 
    value: number; 
    isPositive: boolean;
  };
  delay?: number;
}

export function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  delay = 0 
}: MetricCardProps) {
  return (
    <BentoCard delay={delay}>
      <div className="flex justify-between items-start h-full">
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {trend && (
              <span 
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2",
                  trend.isPositive 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-accent/20">
          <Icon className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>
    </BentoCard>
  );
}
