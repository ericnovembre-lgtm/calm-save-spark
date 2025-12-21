import { useMemo, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { format, addMonths } from 'date-fns';
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DataPoint {
  date: Date;
  score: number;
  isProjected?: boolean;
  confidenceLow?: number;
  confidenceHigh?: number;
}

interface PredictiveTimelineChartProps {
  historicalData: Array<{ score: number; calculated_at: string }>;
  currentScore: number;
}

/**
 * EKG-style Pulse Stream Chart with liquid flow animation
 */
export const PredictiveTimelineChart = ({
  historicalData,
  currentScore,
}: PredictiveTimelineChartProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [animationPhase, setAnimationPhase] = useState<'draw' | 'pulse' | 'stable'>('draw');

  const chartData = useMemo(() => {
    // Process historical data (last 6 months)
    const historical: DataPoint[] = historicalData.map(item => ({
      date: new Date(item.calculated_at),
      score: item.score,
      isProjected: false,
    }));

    // Add current score if not in history
    if (historical.length === 0 || historical[historical.length - 1].score !== currentScore) {
      historical.push({
        date: new Date(),
        score: currentScore,
        isProjected: false,
      });
    }

    // Calculate trend
    const recentScores = historical.slice(-3).map(d => d.score);
    const avgChange = recentScores.length > 1
      ? (recentScores[recentScores.length - 1] - recentScores[0]) / (recentScores.length - 1)
      : 0;

    // Generate projections (next 3 months)
    const projected: DataPoint[] = [];
    for (let i = 1; i <= 3; i++) {
      const projectedScore = Math.max(0, Math.min(100, currentScore + avgChange * i));
      const uncertainty = i * 5;
      
      projected.push({
        date: addMonths(new Date(), i),
        score: projectedScore,
        isProjected: true,
        confidenceLow: Math.max(0, projectedScore - uncertainty),
        confidenceHigh: Math.min(100, projectedScore + uncertainty),
      });
    }

    return [...historical, ...projected];
  }, [historicalData, currentScore]);

  // Animation phases
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationPhase('stable');
      return;
    }

    const drawTimer = setTimeout(() => setAnimationPhase('pulse'), 1800);
    const pulseTimer = setTimeout(() => setAnimationPhase('stable'), 3500);

    return () => {
      clearTimeout(drawTimer);
      clearTimeout(pulseTimer);
    };
  }, [prefersReducedMotion]);

  // Calculate SVG path for the line chart
  const width = 800;
  const height = 320;
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xScale = (index: number) => (index / (chartData.length - 1)) * chartWidth + padding;
  const yScale = (score: number) => height - padding - (score / 100) * chartHeight;

  // Create smooth bezier curve path
  const createSmoothPath = (data: DataPoint[], startIndex = 0, endIndex?: number) => {
    const points = data.slice(startIndex, endIndex);
    if (points.length === 0) return '';

    let path = `M ${xScale(startIndex)} ${yScale(points[0].score)}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = { x: xScale(startIndex + i - 1), y: yScale(points[i - 1].score) };
      const currentPoint = { x: xScale(startIndex + i), y: yScale(points[i].score) };
      
      // Control points for smooth curve
      const cpx1 = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
      const cpy1 = prevPoint.y;
      const cpx2 = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
      const cpy2 = currentPoint.y;

      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${currentPoint.x} ${currentPoint.y}`;
    }

    return path;
  };

  // Create area path for liquid fill
  const createAreaPath = (data: DataPoint[], startIndex = 0, endIndex?: number) => {
    const linePath = createSmoothPath(data, startIndex, endIndex);
    const points = data.slice(startIndex, endIndex);
    if (points.length === 0) return '';

    const lastX = xScale(startIndex + points.length - 1);
    const firstX = xScale(startIndex);
    const bottomY = height - padding;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const projectionStartIndex = chartData.findIndex(d => d.isProjected);
  const historicalPath = createSmoothPath(chartData, 0, projectionStartIndex + 1);
  const projectedPath = projectionStartIndex > 0 
    ? createSmoothPath(chartData, projectionStartIndex, chartData.length)
    : '';
  const areaPath = createAreaPath(chartData, 0, projectionStartIndex + 1);

  const trend = chartData[chartData.length - 1].score - currentScore;

  return (
    <Card className="p-6 overflow-hidden relative">
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
        animate={animationPhase === 'pulse' ? { opacity: [0.3, 0.1, 0.3] } : { opacity: 0.1 }}
        transition={{ duration: 0.6, repeat: animationPhase === 'pulse' ? 3 : 0 }}
      />

      <div className="relative mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={animationPhase === 'pulse' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, repeat: animationPhase === 'pulse' ? 3 : 0 }}
          >
            <Activity className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Pulse Stream Analysis
              {trend > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time health vitals with 3-month projection
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '600px' }}>
          <defs>
            {/* Liquid gradient fill */}
            <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Animated wave pattern */}
            <pattern id="wavePattern" x="0" y="0" width="60" height="10" patternUnits="userSpaceOnUse">
              <motion.path
                d="M 0 5 Q 15 0, 30 5 T 60 5"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                animate={{ x: [0, -60] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </pattern>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((score) => (
            <g key={score}>
              <line
                x1={padding}
                y1={yScale(score)}
                x2={width - padding}
                y2={yScale(score)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
                strokeOpacity="0.15"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 12}
                y={yScale(score) + 4}
                fontSize="11"
                className="fill-muted-foreground"
                textAnchor="end"
              >
                {score}
              </text>
            </g>
          ))}

          {/* Liquid fill area */}
          <motion.path
            d={areaPath}
            fill="url(#liquidGradient)"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom' }}
          />

          {/* Confidence area (projected) */}
          {projectionStartIndex > 0 && chartData.slice(projectionStartIndex).length > 0 && (
            <motion.path
              d={(() => {
                const projectedPoints = chartData.slice(projectionStartIndex);
                let topPath = `M ${xScale(projectionStartIndex)} ${yScale(projectedPoints[0].confidenceHigh || projectedPoints[0].score)}`;
                let bottomPoints: string[] = [];

                projectedPoints.forEach((point, i) => {
                  const x = xScale(projectionStartIndex + i);
                  topPath += ` L ${x} ${yScale(point.confidenceHigh || point.score)}`;
                  bottomPoints.unshift(`${x} ${yScale(point.confidenceLow || point.score)}`);
                });

                return `${topPath} L ${bottomPoints.join(' L ')} Z`;
              })()}
              fill="hsl(var(--primary))"
              fillOpacity="0.08"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            />
          )}

          {/* Historical line - Main EKG pulse */}
          <motion.path
            d={historicalPath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={animationPhase === 'pulse' ? 4 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              strokeWidth: animationPhase === 'pulse' ? [3, 5, 3] : 3
            }}
            transition={{ 
              pathLength: { duration: prefersReducedMotion ? 0 : 1.5, ease: 'easeOut' },
              strokeWidth: { duration: 0.3, repeat: animationPhase === 'pulse' ? 3 : 0 }
            }}
          />

          {/* Projected line (dashed) */}
          {projectionStartIndex > 0 && projectedPath && (
            <motion.path
              d={projectedPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeDasharray="10 6"
              strokeLinecap="round"
              strokeOpacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.8, duration: prefersReducedMotion ? 0 : 1, ease: 'easeOut' }}
            />
          )}

          {/* Data points with pulse effect */}
          {chartData.map((d, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : 0.8 + i * 0.08, 
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
            >
              {/* Outer pulse ring */}
              {!d.isProjected && (
                <motion.circle
                  cx={xScale(i)}
                  cy={yScale(d.score)}
                  r={12}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                  animate={animationPhase === 'pulse' ? { 
                    r: [12, 18, 12],
                    strokeOpacity: [0.2, 0.4, 0.2]
                  } : {}}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              )}
              
              {/* Core point */}
              <circle
                cx={xScale(i)}
                cy={yScale(d.score)}
                r={d.isProjected ? 4 : 6}
                fill={d.isProjected ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
                opacity={d.isProjected ? 0.5 : 1}
              />
              
              {/* Inner glow */}
              {!d.isProjected && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.score)}
                  r={3}
                  fill="hsl(var(--background))"
                />
              )}
            </motion.g>
          ))}

          {/* X-axis labels */}
          {chartData.filter((_, i) => i % 2 === 0 || i === chartData.length - 1).map((d, idx) => {
            const actualIndex = idx === Math.floor(chartData.length / 2) ? chartData.length - 1 : idx * 2;
            const point = chartData[actualIndex];
            if (!point) return null;
            
            return (
              <text
                key={actualIndex}
                x={xScale(actualIndex)}
                y={height - padding + 25}
                fontSize="11"
                className={`fill-muted-foreground ${point.isProjected ? 'italic' : ''}`}
                textAnchor="middle"
              >
                {format(point.date, 'MMM yy')}
              </text>
            );
          })}

          {/* Divider line between historical and projected */}
          {projectionStartIndex > 0 && (
            <motion.line
              x1={xScale(projectionStartIndex)}
              y1={padding - 10}
              x2={xScale(projectionStartIndex)}
              y2={height - padding + 10}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeOpacity="0.4"
              strokeDasharray="6 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary rounded-full" />
          <span className="text-muted-foreground">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary/50 rounded-full" style={{ borderTop: '2px dashed hsl(var(--primary))' }} />
          <span className="text-muted-foreground">Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-primary/30 to-transparent rounded" />
          <span className="text-muted-foreground">Vitality Flow</span>
        </div>
      </div>

      {/* Insight with EKG styling */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            {trend > 5 ? (
              <>
                <span className="font-semibold text-green-500">Vital signs improving!</span> Your financial health is projected to strengthen by{' '}
                <span className="font-semibold">{Math.abs(trend).toFixed(1)} points</span> over the next 3 months.
              </>
            ) : trend < -5 ? (
              <>
                <span className="font-semibold text-red-500">Attention needed.</span> Without intervention, your score may decline by{' '}
                <span className="font-semibold">{Math.abs(trend).toFixed(1)} points</span>. Let's stabilize your financial vitals.
              </>
            ) : (
              <>
                <span className="font-semibold text-primary">Stable vitals.</span> Your financial health is holding steady. Small optimizations could elevate your score further.
              </>
            )}
          </p>
        </div>
      </motion.div>
    </Card>
  );
};
