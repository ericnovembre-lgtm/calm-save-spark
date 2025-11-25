import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NeonCreditGaugeProps {
  score: number;
  projectedScore?: number;
}

export const NeonCreditGauge = ({ score, projectedScore }: NeonCreditGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(300);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 800) return 'hsl(180 84% 39%)'; // Cyan
    if (s >= 700) return 'hsl(142 76% 36%)'; // Emerald
    if (s >= 600) return 'hsl(38 92% 50%)'; // Amber
    return 'hsl(0 84% 60%)'; // Red
  };

  const getScoreGradient = (s: number) => {
    if (s >= 800) return 'url(#gradient-cyan)';
    if (s >= 700) return 'url(#gradient-emerald)';
    if (s >= 600) return 'url(#gradient-amber)';
    return 'url(#gradient-red)';
  };

  // Calculate needle angles (180° arc, starts at -90°)
  const calculateAngle = (s: number) => {
    const minScore = 300;
    const maxScore = 850;
    const clampedScore = Math.max(minScore, Math.min(maxScore, s));
    return -90 + (180 * (clampedScore - minScore) / (maxScore - minScore));
  };

  const currentAngle = calculateAngle(animatedScore);
  const projectedAngle = projectedScore ? calculateAngle(projectedScore) : currentAngle;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0 84% 60%)" />
            <stop offset="100%" stopColor="hsl(0 72% 51%)" />
          </linearGradient>
          <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(38 92% 50%)" />
            <stop offset="100%" stopColor="hsl(45 93% 47%)" />
          </linearGradient>
          <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(142 76% 36%)" />
            <stop offset="100%" stopColor="hsl(160 84% 39%)" />
          </linearGradient>
          <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(180 84% 39%)" />
            <stop offset="100%" stopColor="hsl(200 88% 40%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--cyber-border))"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Colored Score Arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getScoreGradient(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251.2"
          initial={{ strokeDashoffset: 251.2 }}
          animate={{ 
            strokeDashoffset: 251.2 - (251.2 * (animatedScore - 300) / 550)
          }}
          transition={{ 
            type: "spring",
            damping: 15,
            stiffness: 80,
            duration: 1.5
          }}
          filter="url(#glow)"
        />

        {/* Tick Marks */}
        {[300, 400, 500, 600, 700, 800, 850].map((tick) => {
          // Map score to angle: 300→π (left), 850→0 (right)
          const theta = Math.PI * (850 - tick) / 550;
          const x1 = 100 + 72 * Math.cos(theta);
          const y1 = 100 - 72 * Math.sin(theta);
          const x2 = 100 + 80 * Math.cos(theta);
          const y2 = 100 - 80 * Math.sin(theta);
          
          return (
            <g key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
              />
              <text
                x={100 + 90 * Math.cos(theta)}
                y={100 - 90 * Math.sin(theta)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[6px] fill-muted-foreground font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Ghost Needle (Projected) */}
        {projectedScore && projectedScore !== score && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <motion.line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={getScoreColor(projectedScore)}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ rotate: currentAngle }}
              animate={{ rotate: projectedAngle }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              style={{ transformOrigin: '100px 100px' }}
            />
          </motion.g>
        )}

        {/* Main Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: currentAngle }}
          transition={{ 
            type: "spring",
            damping: 15,
            stiffness: 80,
            duration: 1.5
          }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke={getScoreColor(score)}
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          <circle
            cx="100"
            cy="100"
            r="4"
            fill={getScoreColor(score)}
            filter="url(#glow)"
          />
        </motion.g>

        {/* Center Hub */}
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="hsl(var(--cyber-surface))"
          stroke={getScoreColor(score)}
          strokeWidth="2"
          filter="url(#glow)"
        />
      </svg>

      {/* Score Display */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <motion.div
          className="text-6xl font-mono font-bold"
          style={{ color: getScoreColor(score) }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(animatedScore)}
        </motion.div>
        <div className="text-sm text-muted-foreground font-mono mt-1">
          FICO® SCORE
        </div>
      </div>

      {/* Projected Score Badge */}
      {projectedScore && projectedScore !== score && (
        <motion.div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{
            backgroundColor: `${getScoreColor(projectedScore)}20`,
            color: getScoreColor(projectedScore),
            border: `1px solid ${getScoreColor(projectedScore)}40`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {projectedScore > score ? '+' : ''}{projectedScore - score} pts
        </motion.div>
      )}
    </div>
  );
};
