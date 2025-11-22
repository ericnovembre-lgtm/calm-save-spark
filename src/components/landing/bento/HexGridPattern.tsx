import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const HexGridPattern = () => {
  const prefersReducedMotion = useReducedMotion();

  const hexagons = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i % 6) * 60,
    y: Math.floor(i / 6) * 52,
    delay: Math.random() * 2,
  }));

  if (prefersReducedMotion) {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        {hexagons.map((hex) => (
          <polygon
            key={hex.id}
            points="30,0 52.5,15 52.5,45 30,60 7.5,45 7.5,15"
            transform={`translate(${hex.x}, ${hex.y})`}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="0.5"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
      {hexagons.map((hex) => (
        <motion.polygon
          key={hex.id}
          points="30,0 52.5,15 52.5,45 30,60 7.5,45 7.5,15"
          transform={`translate(${hex.x}, ${hex.y})`}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: hex.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Glowing nodes at intersections */}
      {hexagons.slice(0, 8).map((hex, i) => (
        <motion.circle
          key={`node-${hex.id}`}
          cx={hex.x + 30}
          cy={hex.y}
          r="2"
          fill="rgb(34, 197, 94)"
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
};
