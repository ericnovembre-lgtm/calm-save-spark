import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedIconProps {
  className?: string;
}

/**
 * Premium Animated Icons
 * 
 * Self-drawing/animated SVG icons for Premium Hub features.
 * Uses only --primary, --accent, --muted variables.
 */

// Alternatives Portal - Diamond facets shine
export const AlternativesIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <motion.path
        d="M24 4L44 18L24 44L4 18L24 4Z"
        fill="none"
        stroke="url(#diamondGrad)"
        strokeWidth="2"
        variants={{
          idle: { pathLength: 1, opacity: 0.8 },
          hover: { pathLength: 1, opacity: 1 }
        }}
      />
      {/* Facet lines */}
      <motion.path
        d="M24 4L24 44M4 18L44 18M24 4L4 18M24 4L44 18M24 44L4 18M24 44L44 18"
        fill="none"
        stroke="hsl(var(--primary) / 0.4)"
        strokeWidth="1"
        variants={{
          idle: { opacity: 0.3 },
          hover: { opacity: 0.7, transition: { duration: 0.3 } }
        }}
      />
      {/* Center shine */}
      <motion.circle
        cx="24"
        cy="22"
        r="3"
        fill="hsl(var(--primary))"
        variants={{
          idle: { scale: 0.8, opacity: 0.5 },
          hover: { scale: 1.2, opacity: 1, transition: { duration: 0.3 } }
        }}
      />
    </motion.svg>
  );
};

// Family Office - Building with windows
export const FamilyOfficeIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Building outline */}
      <motion.rect
        x="8"
        y="12"
        width="32"
        height="32"
        rx="2"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          idle: { opacity: 0.8 },
          hover: { opacity: 1 }
        }}
      />
      {/* Roof/crown */}
      <motion.path
        d="M8 12L24 4L40 12"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        variants={{
          idle: { opacity: 0.6 },
          hover: { opacity: 1 }
        }}
      />
      {/* Windows */}
      {[
        { x: 14, y: 18 },
        { x: 26, y: 18 },
        { x: 14, y: 28 },
        { x: 26, y: 28 },
      ].map((pos, i) => (
        <motion.rect
          key={i}
          x={pos.x}
          y={pos.y}
          width="8"
          height="6"
          rx="1"
          fill="hsl(var(--primary))"
          variants={{
            idle: { opacity: 0.3 },
            hover: { 
              opacity: 1, 
              transition: { delay: i * 0.1, duration: 0.2 } 
            }
          }}
        />
      ))}
      {/* Door */}
      <motion.rect
        x="20"
        y="36"
        width="8"
        height="8"
        rx="1"
        fill="hsl(var(--accent))"
        variants={{
          idle: { opacity: 0.5 },
          hover: { opacity: 1 }
        }}
      />
    </motion.svg>
  );
};

// Corporate Wellness - People with connection
export const CorporateWellnessIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Left person */}
      <motion.circle
        cx="12"
        cy="16"
        r="6"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      <motion.path
        d="M4 38C4 30 8 26 12 26C16 26 20 30 20 38"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      
      {/* Right person */}
      <motion.circle
        cx="36"
        cy="16"
        r="6"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      <motion.path
        d="M28 38C28 30 32 26 36 26C40 26 44 30 44 38"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      
      {/* Connection lines */}
      <motion.path
        d="M18 16H30"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeDasharray="4 2"
        variants={{
          idle: { pathLength: 0, opacity: 0 },
          hover: { 
            pathLength: 1, 
            opacity: 1,
            transition: { duration: 0.5 }
          }
        }}
      />
      
      {/* Center heart */}
      <motion.path
        d="M24 22L22 24C20 22 20 20 22 18C23 17 24 18 24 18C24 18 25 17 26 18C28 20 28 22 26 24L24 22Z"
        fill="hsl(var(--accent))"
        variants={{
          idle: { scale: 0.8, opacity: 0.5 },
          hover: { scale: 1.1, opacity: 1 }
        }}
      />
    </motion.svg>
  );
};

// Investment Manager - Chart rising
export const InvestmentIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Chart bars */}
      {[
        { x: 8, height: 16, delay: 0 },
        { x: 18, height: 24, delay: 0.1 },
        { x: 28, height: 20, delay: 0.2 },
        { x: 38, height: 32, delay: 0.3 },
      ].map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x}
          y={44 - bar.height}
          width="6"
          height={bar.height}
          rx="2"
          fill={i === 3 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
          variants={{
            idle: { scaleY: 0.7, opacity: 0.6 },
            hover: { 
              scaleY: 1, 
              opacity: 1,
              transition: { delay: bar.delay, duration: 0.3 }
            }
          }}
          style={{ originY: 1 }}
        />
      ))}
      
      {/* Trend line */}
      <motion.path
        d="M8 36L18 26L28 30L44 10"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          idle: { pathLength: 0.5, opacity: 0.4 },
          hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } }
        }}
      />
      
      {/* Arrow head */}
      <motion.path
        d="M40 8L44 10L42 14"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          idle: { opacity: 0 },
          hover: { opacity: 1, transition: { delay: 0.4 } }
        }}
      />
    </motion.svg>
  );
};

// LifeSim - Gamepad with glow
export const LifeSimIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Controller body */}
      <motion.path
        d="M8 20C8 16 10 14 14 14H34C38 14 40 16 40 20V32C40 36 38 38 34 38H14C10 38 8 36 8 32V20Z"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          idle: { opacity: 0.8 },
          hover: { opacity: 1 }
        }}
      />
      
      {/* D-pad */}
      <motion.path
        d="M16 22V30M12 26H20"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Buttons */}
      <motion.circle
        cx="32"
        cy="22"
        r="3"
        fill="hsl(var(--accent))"
        variants={{
          idle: { scale: 1 },
          hover: { 
            scale: [1, 1.2, 1], 
            transition: { repeat: Infinity, duration: 0.8 } 
          }
        }}
      />
      <motion.circle
        cx="36"
        cy="26"
        r="3"
        fill="hsl(var(--primary))"
        variants={{
          idle: { scale: 1 },
          hover: { 
            scale: [1, 1.2, 1], 
            transition: { repeat: Infinity, duration: 0.8, delay: 0.2 } 
          }
        }}
      />
      
      {/* Glow effect */}
      <motion.ellipse
        cx="24"
        cy="44"
        rx="16"
        ry="4"
        fill="hsl(var(--primary))"
        variants={{
          idle: { opacity: 0 },
          hover: { opacity: 0.2 }
        }}
      />
    </motion.svg>
  );
};

// Digital Twin - Mirror effect
export const DigitalTwinIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Left figure */}
      <motion.circle cx="16" cy="12" r="5" fill="hsl(var(--primary))" />
      <motion.rect x="12" y="18" width="8" height="16" rx="2" fill="hsl(var(--primary))" />
      <motion.rect x="10" y="36" width="4" height="8" rx="1" fill="hsl(var(--primary))" />
      <motion.rect x="18" y="36" width="4" height="8" rx="1" fill="hsl(var(--primary))" />
      
      {/* Mirror line */}
      <motion.line
        x1="24"
        y1="4"
        x2="24"
        y2="44"
        stroke="hsl(var(--accent))"
        strokeWidth="1"
        strokeDasharray="4 4"
        variants={{
          idle: { opacity: 0.3 },
          hover: { opacity: 0.8 }
        }}
      />
      
      {/* Right figure (reflection) */}
      <motion.g
        variants={{
          idle: { opacity: 0.4 },
          hover: { opacity: 0.8, transition: { duration: 0.3 } }
        }}
      >
        <motion.circle cx="32" cy="12" r="5" fill="hsl(var(--accent))" />
        <motion.rect x="28" y="18" width="8" height="16" rx="2" fill="hsl(var(--accent))" />
        <motion.rect x="26" y="36" width="4" height="8" rx="1" fill="hsl(var(--accent))" />
        <motion.rect x="34" y="36" width="4" height="8" rx="1" fill="hsl(var(--accent))" />
      </motion.g>
      
      {/* Data streams */}
      {[14, 20, 26, 32].map((y, i) => (
        <motion.line
          key={i}
          x1="20"
          y1={y}
          x2="28"
          y2={y}
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="1"
          variants={{
            idle: { pathLength: 0, opacity: 0 },
            hover: { 
              pathLength: 1, 
              opacity: 0.6,
              transition: { delay: i * 0.1, duration: 0.3 }
            }
          }}
        />
      ))}
    </motion.svg>
  );
};

// Refinancing Hub - Circular arrows
export const RefinancingIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Circular arrows */}
      <motion.path
        d="M24 8A16 16 0 0 1 40 24"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        variants={{
          idle: { rotate: 0 },
          hover: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }
        }}
        style={{ originX: "24px", originY: "24px" }}
      />
      <motion.path
        d="M24 40A16 16 0 0 1 8 24"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        variants={{
          idle: { rotate: 0 },
          hover: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }
        }}
        style={{ originX: "24px", originY: "24px" }}
      />
      
      {/* Arrow heads */}
      <motion.path
        d="M36 8L40 12L44 8"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M4 40L8 36L12 40"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center percentage */}
      <motion.text
        x="24"
        y="28"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        variants={{
          idle: { opacity: 0.6 },
          hover: { opacity: 1 }
        }}
      >
        %
      </motion.text>
    </motion.svg>
  );
};

// DeFi Manager - Coin with blockchain
export const DeFiIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Main coin */}
      <motion.circle
        cx="24"
        cy="24"
        r="14"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        variants={{
          idle: { opacity: 0.8 },
          hover: { opacity: 1 }
        }}
      />
      <motion.circle
        cx="24"
        cy="24"
        r="10"
        fill="hsl(var(--accent) / 0.2)"
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.1 }
        }}
      />
      
      {/* Blockchain links */}
      {[
        { x: 8, y: 8 },
        { x: 40, y: 8 },
        { x: 8, y: 40 },
        { x: 40, y: 40 },
      ].map((pos, i) => (
        <motion.g key={i}>
          <motion.rect
            x={pos.x - 4}
            y={pos.y - 4}
            width="8"
            height="8"
            rx="2"
            fill="hsl(var(--primary))"
            variants={{
              idle: { opacity: 0.4, scale: 0.8 },
              hover: { 
                opacity: 1, 
                scale: 1,
                transition: { delay: i * 0.1 }
              }
            }}
          />
          <motion.line
            x1={pos.x}
            y1={pos.y}
            x2="24"
            y2="24"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
            variants={{
              idle: { pathLength: 0 },
              hover: { 
                pathLength: 1,
                transition: { delay: i * 0.1, duration: 0.3 }
              }
            }}
          />
        </motion.g>
      ))}
      
      {/* Center symbol */}
      <motion.text
        x="24"
        y="28"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="hsl(var(--accent))"
      >
        Ξ
      </motion.text>
    </motion.svg>
  );
};

// Tax Documents - Document with checkmarks
export const TaxDocumentsIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Document */}
      <motion.path
        d="M12 8H28L36 16V40C36 42 34 44 32 44H12C10 44 8 42 8 40V12C8 10 10 8 12 8Z"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      {/* Folded corner */}
      <motion.path
        d="M28 8V16H36"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      
      {/* Checkmark lines */}
      {[22, 28, 34].map((y, i) => (
        <motion.g key={i}>
          <motion.rect
            x="14"
            y={y}
            width="4"
            height="4"
            rx="1"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
          />
          <motion.path
            d={`M15 ${y + 2}L16 ${y + 3}L18 ${y + 1}`}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              idle: { pathLength: 0, opacity: 0 },
              hover: { 
                pathLength: 1, 
                opacity: 1,
                transition: { delay: i * 0.15, duration: 0.3 }
              }
            }}
          />
          <motion.line
            x1="22"
            y1={y + 2}
            x2="30"
            y2={y + 2}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>
      ))}
    </motion.svg>
  );
};

// Referral Center - Gift opening
export const ReferralIcon = ({ className }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      initial="idle"
      whileHover={prefersReducedMotion ? "idle" : "hover"}
    >
      {/* Box bottom */}
      <motion.rect
        x="8"
        y="22"
        width="32"
        height="22"
        rx="2"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      
      {/* Ribbon vertical */}
      <motion.rect
        x="22"
        y="22"
        width="4"
        height="22"
        fill="hsl(var(--accent))"
      />
      
      {/* Lid */}
      <motion.rect
        x="6"
        y="14"
        width="36"
        height="8"
        rx="2"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          idle: { y: 14 },
          hover: { y: 8, transition: { duration: 0.3 } }
        }}
      />
      
      {/* Ribbon on lid */}
      <motion.rect
        x="22"
        y="14"
        width="4"
        height="8"
        fill="hsl(var(--accent))"
        variants={{
          idle: { y: 14 },
          hover: { y: 8, transition: { duration: 0.3 } }
        }}
      />
      
      {/* Bow */}
      <motion.path
        d="M24 14C20 14 18 10 18 8C18 6 20 4 24 4C28 4 30 6 30 8C30 10 28 14 24 14Z"
        fill="hsl(var(--accent))"
        variants={{
          idle: { scale: 1, y: 0 },
          hover: { scale: 1.1, y: -6, transition: { duration: 0.3 } }
        }}
      />
      
      {/* Sparkles on open */}
      {[
        { x: 16, y: 18, delay: 0.1 },
        { x: 32, y: 16, delay: 0.2 },
        { x: 24, y: 12, delay: 0.15 },
      ].map((spark, i) => (
        <motion.circle
          key={i}
          cx={spark.x}
          cy={spark.y}
          r="2"
          fill="hsl(var(--accent))"
          variants={{
            idle: { scale: 0, opacity: 0 },
            hover: { 
              scale: [0, 1, 0], 
              opacity: [0, 1, 0],
              y: -10,
              transition: { delay: spark.delay, duration: 0.5 }
            }
          }}
        />
      ))}
    </motion.svg>
  );
};