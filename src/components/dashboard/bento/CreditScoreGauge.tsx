/**
 * CreditScoreGauge - Radial donut gauge for credit score display
 * Features rounded caps, centered score, and gold accent colors
 */

import { useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CreditScoreGaugeProps {
  score?: number;
  previousScore?: number;
  delay?: number;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 800) return { label: "Excellent", color: "text-emerald-600" };
  if (score >= 740) return { label: "Very Good", color: "text-emerald-500" };
  if (score >= 670) return { label: "Good", color: "text-amber-500" };
  if (score >= 580) return { label: "Fair", color: "text-orange-500" };
  return { label: "Poor", color: "text-red-500" };
}

export function CreditScoreGauge({ 
  score = 785, 
  previousScore = 770,
  delay = 0 
}: CreditScoreGaugeProps) {
  const scoreChange = score - previousScore;
  const isPositive = scoreChange >= 0;
  const { label, color } = getScoreLabel(score);
  
  // Calculate percentage (300-850 range)
  const percentage = ((score - 300) / (850 - 300)) * 100;
  
  const chartData = useMemo(() => [
    {
      name: "Credit Score",
      value: percentage,
      fill: "#D4AF37",
    },
  ], [percentage]);

  return (
    <BentoCard delay={delay} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">Credit Score</h3>
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}{scoreChange}
        </div>
      </div>
      
      <div className="flex-1 relative min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="70%"
          >
            <RadialBar
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value"
              cornerRadius={15}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Centered Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '20%' }}>
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <span className={`text-sm font-medium ${color}`}>{label}</span>
        </div>
      </div>
      
      {/* Score Range Indicators */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>300</span>
        <span>850</span>
      </div>
    </BentoCard>
  );
}
