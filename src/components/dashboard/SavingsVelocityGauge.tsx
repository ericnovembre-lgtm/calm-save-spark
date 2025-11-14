import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SavingsVelocityGaugeProps {
  velocity: number; // 0-100 representing savings rate
  className?: string;
}

export function SavingsVelocityGauge({ velocity, className = "" }: SavingsVelocityGaugeProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Clamp velocity between 0-100
  const clampedVelocity = Math.max(0, Math.min(100, velocity));
  
  // Calculate needle rotation (-90 to 90 degrees)
  const needleRotation = (clampedVelocity / 100) * 180 - 90;
  
  // Determine color zone
  const getColor = () => {
    if (clampedVelocity < 33) return "hsl(var(--destructive))";
    if (clampedVelocity < 66) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  const getZoneLabel = () => {
    if (clampedVelocity < 33) return "Low";
    if (clampedVelocity < 66) return "Medium";
    return "High";
  };

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc zones */}
        <defs>
          <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="gauge-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="gauge-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* Red zone (0-33%) */}
        <path
          d="M 30 100 A 70 70 0 0 1 70 30"
          fill="none"
          stroke="url(#gauge-red)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Yellow zone (33-66%) */}
        <path
          d="M 70 30 A 70 70 0 0 1 130 30"
          fill="none"
          stroke="url(#gauge-yellow)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Green zone (66-100%) */}
        <path
          d="M 130 30 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="url(#gauge-green)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 60 * Math.cos(rad);
          const y1 = 100 + 60 * Math.sin(rad);
          const x2 = 100 + 70 * Math.cos(rad);
          const y2 = 100 + 70 * Math.sin(rad);
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              opacity={0.5}
            />
          );
        })}

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: needleRotation }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 15,
            mass: 1,
            duration: prefersReducedMotion ? 0 : 1
          }}
          style={{ originX: "100px", originY: "100px" }}
        >
          <path
            d="M 100 100 L 95 95 L 100 30 L 105 95 Z"
            fill={getColor()}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
        </motion.g>

        {/* Center dot */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill={getColor()}
          className="drop-shadow-lg"
        />

        {/* Particle effects based on velocity */}
        {!prefersReducedMotion && clampedVelocity > 50 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx="100"
                cy="100"
                r="2"
                fill={getColor()}
                opacity={0}
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, -Math.random() * 40],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Low</span>
        <motion.span
          className="font-semibold"
          style={{ color: getColor() }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {getZoneLabel()}
        </motion.span>
        <span>High</span>
      </div>

      {/* Velocity percentage */}
      <div className="text-center mt-2">
        <motion.div
          className="text-2xl font-bold tabular-nums"
          style={{ color: getColor() }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {Math.round(clampedVelocity)}%
        </motion.div>
        <div className="text-xs text-muted-foreground">Savings Rate</div>
      </div>
    </div>
  );
}
