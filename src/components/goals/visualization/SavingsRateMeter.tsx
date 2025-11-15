import { motion } from 'framer-motion';

interface SavingsRateMeterProps {
  rate: number; // 0-100
  size?: number;
}

/**
 * Speedometer-style savings rate gauge
 */
export const SavingsRateMeter = ({ rate, size = 200 }: SavingsRateMeterProps) => {
  const clampedRate = Math.max(0, Math.min(100, rate));
  const angle = (clampedRate / 100) * 180 - 90; // -90 to 90 degrees

  const getColor = (rate: number) => {
    if (rate < 30) return 'hsl(var(--destructive))';
    if (rate < 60) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  return (
    <div 
      className="relative flex flex-col items-center"
      style={{ width: size, height: size * 0.6 }}
    >
      {/* Arc background */}
      <svg width={size} height={size * 0.6} className="overflow-visible">
        <defs>
          <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" />
            <stop offset="50%" stopColor="hsl(var(--warning))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${size * 0.1},${size * 0.5} A ${size * 0.4},${size * 0.4} 0 0,1 ${size * 0.9},${size * 0.5}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          opacity={0.2}
        />

        {/* Progress arc */}
        <motion.path
          d={`M ${size * 0.1},${size * 0.5} A ${size * 0.4},${size * 0.4} 0 0,1 ${size * 0.9},${size * 0.5}`}
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clampedRate / 100 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* Needle */}
      <motion.div
        className="absolute origin-bottom"
        style={{
          width: 4,
          height: size * 0.35,
          backgroundColor: getColor(clampedRate),
          bottom: size * 0.1,
          left: '50%',
          marginLeft: -2,
          borderRadius: 2
        }}
        initial={{ rotate: -90 }}
        animate={{ rotate: angle }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 100
        }}
      />

      {/* Center dot */}
      <div
        className="absolute rounded-full bg-card border-4"
        style={{
          width: size * 0.12,
          height: size * 0.12,
          bottom: size * 0.04,
          left: '50%',
          marginLeft: -size * 0.06,
          borderColor: getColor(clampedRate)
        }}
      />

      {/* Value display */}
      <div 
        className="absolute text-center"
        style={{ bottom: -size * 0.2 }}
      >
        <div className="text-3xl font-bold" style={{ color: getColor(clampedRate) }}>
          {clampedRate.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">Savings Rate</div>
      </div>
    </div>
  );
};
