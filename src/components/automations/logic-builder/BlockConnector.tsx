import { motion } from "framer-motion";

interface BlockConnectorProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function BlockConnector({ from, to }: BlockConnectorProps) {
  // Calculate control points for cubic bezier curve
  const midY = (from.y + to.y) / 2;
  
  const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

  return (
    <>
      {/* Glow effect */}
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--circuit-line))"
        strokeWidth="4"
        opacity="0.3"
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main line */}
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--circuit-line))"
        strokeWidth="2"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="10"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </motion.path>

      {/* Arrow head */}
      <motion.circle
        cx={to.x}
        cy={to.y}
        r="4"
        fill="hsl(var(--circuit-line))"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      />
    </>
  );
}
