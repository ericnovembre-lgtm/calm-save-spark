import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataPoint {
  value: number;
  label?: string;
}

interface MiniChartProps {
  data: DataPoint[];
  type?: 'line' | 'bar' | 'area';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  showTrend?: boolean;
  title?: string;
  height?: number;
}

const colorMap = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
};

export function MiniChart({ 
  data, 
  type = 'line', 
  color = 'primary',
  showTrend = true,
  title,
  height = 60,
}: MiniChartProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const { path, trend, trendPercent, min, max } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', trend: 'neutral' as const, trendPercent: 0, min: 0, max: 0 };
    }
    
    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    
    const width = 200;
    const chartHeight = height - 20;
    const padding = 4;
    
    const points = values.map((val, i) => {
      const x = padding + (i / (values.length - 1)) * (width - padding * 2);
      const y = padding + ((maxVal - val) / range) * (chartHeight - padding * 2);
      return { x, y };
    });
    
    let pathString = '';
    if (type === 'line' || type === 'area') {
      pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      
      if (type === 'area') {
        pathString += ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
      }
    }
    
    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const change = ((lastVal - firstVal) / firstVal) * 100;
    
    return {
      path: pathString,
      trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral',
      trendPercent: Math.abs(change).toFixed(1),
      min: minVal,
      max: maxVal,
    };
  }, [data, height, type]);
  
  const strokeColor = colorMap[color];
  
  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {title && (
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        )}
        {showTrend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-success' : 
            trend === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
             trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            <span>{trendPercent}%</span>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 200 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {type === 'bar' ? (
          // Bar chart
          data.map((d, i) => {
            const barWidth = 180 / data.length - 4;
            const barHeight = ((d.value - min) / (max - min || 1)) * (height - 20);
            const x = 10 + i * (180 / data.length);
            const y = height - 10 - barHeight;
            
            return (
              <motion.rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill={strokeColor}
                opacity={0.8}
                initial={prefersReducedMotion ? {} : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{ transformOrigin: 'bottom' }}
              />
            );
          })
        ) : (
          // Line/Area chart
          <>
            {type === 'area' && (
              <motion.path
                d={path}
                fill={strokeColor}
                opacity={0.1}
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            <motion.path
              d={path.replace(/ L \d+ \d+ L \d+ \d+ Z/, '')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={prefersReducedMotion ? {} : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </>
        )}
      </svg>
    </div>
  );
}
