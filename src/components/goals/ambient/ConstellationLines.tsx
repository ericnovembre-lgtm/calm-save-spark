import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

/**
 * Animated constellation lines connecting UI elements
 * Creates sense of interconnection
 */
export const ConstellationLines = () => {
  const [lines, setLines] = useState<Array<{ start: Point; end: Point }>>([]);

  useEffect(() => {
    // Generate random connected points
    const points: Point[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    }));

    const newLines: Array<{ start: Point; end: Point }> = [];
    points.forEach((point, i) => {
      if (i < points.length - 1) {
        newLines.push({ start: point, end: points[i + 1] });
      }
    });

    setLines(newLines);
  }, []);

  return (
    <svg
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {lines.map((line, i) => (
        <g key={i}>
          {/* Line */}
          <motion.line
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />

          {/* Traveling light */}
          <motion.circle
            r="3"
            fill="hsl(var(--primary))"
            opacity="0.6"
            animate={{
              cx: [line.start.x, line.end.x],
              cy: [line.start.y, line.end.y]
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </g>
      ))}
    </svg>
  );
};
