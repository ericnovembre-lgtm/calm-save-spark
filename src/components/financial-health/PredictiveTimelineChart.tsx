import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { format, subMonths, addMonths } from 'date-fns';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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

export const PredictiveTimelineChart = ({
  historicalData,
  currentScore,
}: PredictiveTimelineChartProps) => {
  const prefersReducedMotion = useReducedMotion();

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
      const uncertainty = i * 5; // Uncertainty increases with time
      
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

  // Calculate SVG path for the line chart
  const width = 800;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xScale = (index: number) => (index / (chartData.length - 1)) * chartWidth + padding;
  const yScale = (score: number) => height - padding - (score / 100) * chartHeight;

  const linePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.score)}`)
    .join(' ');

  const confidenceAreaPath = chartData
    .map((d, i) => {
      if (!d.isProjected) return '';
      const x = xScale(i);
      const yLow = yScale(d.confidenceLow || d.score);
      const yHigh = yScale(d.confidenceHigh || d.score);
      return i === chartData.findIndex(p => p.isProjected)
        ? `M ${x} ${yLow} L ${x} ${yHigh}`
        : `L ${x} ${yHigh}`;
    })
    .join(' ');

  const projectionStartIndex = chartData.findIndex(d => d.isProjected);
  const trend = chartData[chartData.length - 1].score - currentScore;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          Health Score Projection
          {trend > 0 ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : trend < 0 ? (
            <TrendingDown className="w-5 h-5 text-red-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          Historical data and 3-month AI-powered projection
        </p>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '600px' }}>
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
                className="text-border opacity-20"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={yScale(score) + 4}
                fontSize="12"
                className="fill-muted-foreground"
                textAnchor="end"
              >
                {score}
              </text>
            </g>
          ))}

          {/* Confidence area (projected) */}
          {confidenceAreaPath && (
            <motion.path
              d={`${confidenceAreaPath} L ${xScale(chartData.length - 1)} ${yScale(chartData[chartData.length - 1].confidenceLow || chartData[chartData.length - 1].score)} Z`}
              fill="currentColor"
              className="text-primary opacity-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />
          )}

          {/* Historical line */}
          <motion.path
            d={linePath.split('L').slice(0, projectionStartIndex + 1).join('L')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: 'easeOut' }}
          />

          {/* Projected line (dashed) */}
          {projectionStartIndex > 0 && (
            <motion.path
              d={linePath.split(' ').slice(projectionStartIndex * 2).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="8 4"
              className="text-primary opacity-60"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5, duration: prefersReducedMotion ? 0 : 1, ease: 'easeOut' }}
            />
          )}

          {/* Data points */}
          {chartData.map((d, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : i * 0.1, type: 'spring' }}
            >
              <circle
                cx={xScale(i)}
                cy={yScale(d.score)}
                r={d.isProjected ? 4 : 6}
                fill="currentColor"
                className={d.isProjected ? 'text-primary opacity-50' : 'text-primary'}
              />
              {!d.isProjected && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.score)}
                  r={10}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary opacity-20"
                />
              )}
            </motion.g>
          ))}

          {/* X-axis labels */}
          {chartData.filter((_, i) => i % 2 === 0).map((d, i) => {
            const actualIndex = i * 2;
            return (
              <text
                key={actualIndex}
                x={xScale(actualIndex)}
                y={height - padding + 20}
                fontSize="11"
                className={`fill-muted-foreground ${d.isProjected ? 'italic' : ''}`}
                textAnchor="middle"
              >
                {format(d.date, 'MMM yy')}
              </text>
            );
          })}

          {/* Divider line between historical and projected */}
          {projectionStartIndex > 0 && (
            <line
              x1={xScale(projectionStartIndex)}
              y1={padding}
              x2={xScale(projectionStartIndex)}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="2"
              className="text-border opacity-30"
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" />
          <span className="text-muted-foreground">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary opacity-60" style={{ borderTop: '2px dashed' }} />
          <span className="text-muted-foreground">Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary opacity-10 rounded" />
          <span className="text-muted-foreground">Confidence Range</span>
        </div>
      </div>

      {/* Insight */}
      <motion.div
        className="mt-6 p-4 rounded-lg bg-accent/50 border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <p className="text-sm text-foreground">
          {trend > 5 ? (
            <>
              <span className="font-semibold text-green-600">Great trajectory! 📈</span> Your score is projected to improve by{' '}
              <span className="font-semibold">{Math.abs(trend).toFixed(1)} points</span> over the next 3 months if current trends continue.
            </>
          ) : trend < -5 ? (
            <>
              <span className="font-semibold text-red-600">Watch out! 📉</span> Your score may decline by{' '}
              <span className="font-semibold">{Math.abs(trend).toFixed(1)} points</span> without action. Let's work on reversing this trend!
            </>
          ) : (
            <>
              <span className="font-semibold text-blue-600">Steady state 📊</span> Your score is expected to remain stable. Small improvements could make a big difference!
            </>
          )}
        </p>
      </motion.div>
    </Card>
  );
};
