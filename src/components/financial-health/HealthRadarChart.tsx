import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MetricData {
  label: string;
  value: number;
  target?: number;
}

interface HealthRadarChartProps {
  metrics: MetricData[];
}

export const HealthRadarChart = ({ metrics }: HealthRadarChartProps) => {
  const prefersReducedMotion = useReducedMotion();
  const size = 400;
  const center = size / 2;
  const radius = size / 2 - 60;
  const levels = 5;

  const points = useMemo(() => {
    const angleStep = (Math.PI * 2) / metrics.length;
    return metrics.map((metric, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (metric.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        label: metric.label,
        value: metric.value,
        angle,
      };
    });
  }, [metrics, center, radius]);

  const targetPoints = useMemo(() => {
    const angleStep = (Math.PI * 2) / metrics.length;
    return metrics.map((metric, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = ((metric.target || 80) / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    });
  }, [metrics, center, radius]);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';
  const targetPathD = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground mb-2">Health Metrics Overview</h3>
        <p className="text-sm text-muted-foreground">360° view of your financial wellness</p>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
        {/* Background circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * radius;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border opacity-20"
            />
          );
        })}

        {/* Axis lines */}
        {points.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(point.angle)}
            y2={center + radius * Math.sin(point.angle)}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border opacity-20"
          />
        ))}

        {/* Target area (ghost overlay) */}
        <motion.path
          d={targetPathD}
          fill="currentColor"
          className="text-primary opacity-10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Current state area */}
        <motion.path
          d={pathD}
          fill="url(#areaGradient)"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: prefersReducedMotion ? 0 : 1.5, ease: 'easeOut' },
            opacity: { duration: 0.3 },
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className="text-primary" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" className="text-primary" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {points.map((point, i) => {
          const labelRadius = radius + 40;
          const labelX = center + labelRadius * Math.cos(point.angle);
          const labelY = center + labelRadius * Math.sin(point.angle);
          const isWeak = point.value < 50;

          return (
            <g key={i}>
              {/* Point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill="currentColor"
                className="text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : i * 0.1,
                  type: 'spring',
                  stiffness: 300,
                }}
              />
              
              {/* Pulsing ring for weak areas */}
              {isWeak && !prefersReducedMotion && (
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={12}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-red-500"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}

              {/* Label */}
              <text
                x={labelX}
                y={labelY}
                fontSize="12"
                fontWeight="600"
                className={`fill-foreground ${isWeak ? 'fill-red-600' : ''}`}
                textAnchor={
                  Math.abs(point.angle) < Math.PI / 4 || Math.abs(point.angle) > (3 * Math.PI) / 4
                    ? 'middle'
                    : point.angle > 0
                    ? 'start'
                    : 'end'
                }
                dominantBaseline="middle"
              >
                {point.label}
              </text>
              
              {/* Value */}
              <text
                x={labelX}
                y={labelY + 14}
                fontSize="10"
                className="fill-muted-foreground"
                textAnchor={
                  Math.abs(point.angle) < Math.PI / 4 || Math.abs(point.angle) > (3 * Math.PI) / 4
                    ? 'middle'
                    : point.angle > 0
                    ? 'start'
                    : 'end'
                }
              >
                {point.value}
              </text>
            </g>
          );
        })}

        {/* Center score */}
        <motion.text
          x={center}
          y={center}
          fontSize="24"
          fontWeight="bold"
          className="fill-primary"
          textAnchor="middle"
          dominantBaseline="middle"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          {Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length)}
        </motion.text>
        <text
          x={center}
          y={center + 20}
          fontSize="10"
          className="fill-muted-foreground"
          textAnchor="middle"
        >
          Average
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary opacity-30" style={{ borderTop: '2px dashed' }} />
          <span className="text-muted-foreground">Target</span>
        </div>
      </div>
    </Card>
  );
};
