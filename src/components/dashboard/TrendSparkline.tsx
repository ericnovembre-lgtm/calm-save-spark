import { motion } from "framer-motion";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TrendSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function TrendSparkline({ 
  data, 
  width = 120, 
  height = 30,
  className = "" 
}: TrendSparklineProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;
  const isPositiveTrend = data[data.length - 1] > data[0];

  return (
    <div className={`relative ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Gradient for fill */}
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop 
              offset="0%" 
              stopColor={isPositiveTrend ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
              stopOpacity={0.3} 
            />
            <stop 
              offset="100%" 
              stopColor={isPositiveTrend ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
              stopOpacity={0} 
            />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <motion.path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill="url(#sparkline-gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        />

        {/* Stroke line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={isPositiveTrend ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 1,
            ease: [0.22, 1, 0.36, 1]
          }}
        />

        {/* Hover points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((value - min) / range) * height;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={hoveredIndex === index ? 4 : 0}
              fill={isPositiveTrend ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              className="transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg border border-border"
        >
          ${data[hoveredIndex].toFixed(2)}
        </motion.div>
      )}
    </div>
  );
}
