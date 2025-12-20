import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedIconProps {
  className?: string;
}

/**
 * GrowWealthAnimatedIcons - Self-drawing SVG icons with growth metaphors
 * 
 * All icons use brand variables only:
 * - hsl(var(--primary))
 * - hsl(var(--accent))
 * - hsl(var(--muted))
 */

// Investment Portfolio - Pie chart segments that fan out
export const InvestmentIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Pie segment 1 */}
      <motion.path
        d="M24 24 L24 4 A20 20 0 0 1 42.5 15.5 Z"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Pie segment 2 */}
      <motion.path
        d="M24 24 L42.5 15.5 A20 20 0 0 1 35 40 Z"
        fill="hsl(var(--primary))"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Pie segment 3 */}
      <motion.path
        d="M24 24 L35 40 A20 20 0 0 1 13 40 Z"
        fill="hsl(var(--muted))"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Pie segment 4 */}
      <motion.path
        d="M24 24 L13 40 A20 20 0 0 1 24 4 Z"
        fill="hsl(var(--accent) / 0.6)"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
    </svg>
  );
};

// Net Worth - Trending line that draws itself upward
export const NetWorthIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Grid lines */}
      <motion.path
        d="M8 40 L8 8 M8 40 L40 40"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Trend line */}
      <motion.path
        d="M10 35 Q18 30 22 25 T32 15 Q36 12 40 10"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Accent dot at peak */}
      <motion.circle
        cx="40"
        cy="10"
        r="3"
        fill="hsl(var(--primary))"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// Real Estate - Building that constructs itself
export const RealEstateIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Building base */}
      <motion.rect
        x="12"
        y="20"
        width="24"
        height="22"
        fill="hsl(var(--muted) / 0.3)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 42px' }}
      />
      {/* Roof */}
      <motion.path
        d="M8 22 L24 8 L40 22"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Windows - staggered appearance */}
      {[[18, 26], [30, 26], [18, 34], [30, 34]].map(([x, y], i) => (
        <motion.rect
          key={i}
          x={x}
          y={y}
          width="6"
          height="5"
          fill="hsl(var(--accent))"
          initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      ))}
    </svg>
  );
};

// Credit Score - Shield that forms with protective pulse
export const CreditScoreIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Shield outline */}
      <motion.path
        d="M24 4 L40 10 L40 24 C40 34 32 42 24 44 C16 42 8 34 8 24 L8 10 Z"
        fill="hsl(var(--muted) / 0.2)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M16 24 L22 30 L32 18"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Pulse effect */}
      {!prefersReducedMotion && (
        <motion.path
          d="M24 4 L40 10 L40 24 C40 34 32 42 24 44 C16 42 8 34 8 24 L8 10 Z"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.15, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          style={{ transformOrigin: '24px 24px' }}
        />
      )}
    </svg>
  );
};

// Goals - Target with rings scaling in from center
export const GoalsIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Outer ring */}
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
        fill="none"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Middle ring */}
      <motion.circle
        cx="24"
        cy="24"
        r="12"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        fill="none"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Inner ring */}
      <motion.circle
        cx="24"
        cy="24"
        r="6"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Bullseye */}
      <motion.circle
        cx="24"
        cy="24"
        r="3"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// Wallet - Opens with coin appearing
export const WalletIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Wallet body */}
      <motion.rect
        x="6"
        y="14"
        width="36"
        height="24"
        rx="4"
        fill="hsl(var(--muted) / 0.3)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scaleX: 0.8, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 26px' }}
      />
      {/* Card slot */}
      <motion.rect
        x="30"
        y="22"
        width="12"
        height="8"
        rx="2"
        fill="hsl(var(--primary) / 0.5)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        initial={prefersReducedMotion ? {} : { x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Coin */}
      <motion.circle
        cx="18"
        cy="26"
        r="5"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// Crypto - Coin with shimmer/pulse effect
export const CryptoIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Outer glow ring */}
      {!prefersReducedMotion && (
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '24px 24px' }}
        />
      )}
      {/* Coin base */}
      <motion.circle
        cx="24"
        cy="24"
        r="16"
        fill="hsl(var(--muted) / 0.3)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Digital pattern */}
      <motion.path
        d="M20 18 L20 30 M24 16 L24 32 M28 18 L28 30"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Shimmer overlay */}
      {!prefersReducedMotion && (
        <motion.ellipse
          cx="20"
          cy="20"
          rx="4"
          ry="8"
          fill="hsl(var(--accent) / 0.3)"
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: [0, 0.5, 0], x: [0, 8, 16], y: [0, 4, 8] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          style={{ transformOrigin: '24px 24px' }}
        />
      )}
    </svg>
  );
};

// Cash Flow - Arrows flowing in a loop (compounding)
export const CashFlowIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Circular arrow path */}
      <motion.path
        d="M24 8 A16 16 0 1 1 8 24"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Arrow head 1 */}
      <motion.path
        d="M24 4 L24 12 L32 8 Z"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {/* Inner loop */}
      <motion.path
        d="M24 40 A8 8 0 1 0 32 32"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Arrow head 2 */}
      <motion.path
        d="M24 44 L24 36 L16 40 Z"
        fill="hsl(var(--primary))"
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// Retirement - Sun rising
export const RetirementIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Horizon line */}
      <motion.path
        d="M4 32 L44 32"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Sun */}
      <motion.path
        d="M24 32 A12 12 0 0 1 36 32"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 32px' }}
      />
      {/* Sun rays */}
      {[[24, 14, 24, 8], [12, 20, 8, 16], [36, 20, 40, 16]].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={prefersReducedMotion ? {} : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </svg>
  );
};

// Achievements/Trophy
export const TrophyIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Trophy cup */}
      <motion.path
        d="M14 8 L14 20 C14 26 18 30 24 30 C30 30 34 26 34 20 L34 8 Z"
        fill="hsl(var(--accent) / 0.3)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 30px' }}
      />
      {/* Handles */}
      <motion.path
        d="M14 12 C8 12 6 16 6 20 C6 24 10 26 14 24"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M34 12 C40 12 42 16 42 20 C42 24 38 26 34 24"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Base */}
      <motion.path
        d="M18 36 L30 36 L28 30 L20 30 Z"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 36px' }}
      />
      <motion.rect
        x="16"
        y="36"
        width="16"
        height="4"
        rx="1"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 38px' }}
      />
    </svg>
  );
};

// Card icon
export const CardIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Card base */}
      <motion.rect
        x="6"
        y="12"
        width="36"
        height="24"
        rx="4"
        fill="hsl(var(--muted) / 0.3)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Magnetic stripe */}
      <motion.rect
        x="6"
        y="18"
        width="36"
        height="6"
        fill="hsl(var(--primary))"
        initial={prefersReducedMotion ? {} : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '6px 21px' }}
      />
      {/* Chip */}
      <motion.rect
        x="12"
        y="26"
        width="8"
        height="6"
        rx="1"
        fill="hsl(var(--accent))"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// Income icon - Dollar with arrow up
export const IncomeIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Circle background */}
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        fill="hsl(var(--muted) / 0.2)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 24px' }}
      />
      {/* Dollar sign */}
      <motion.path
        d="M24 14 L24 34 M20 18 C20 16 22 15 24 15 C26 15 28 16 28 18 C28 20 26 21 24 22 C22 23 20 24 20 26 C20 28 22 29 24 29 C26 29 28 28 28 26"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Up arrow */}
      <motion.path
        d="M36 16 L40 12 L44 16 M40 12 L40 24"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

// Challenges icon - Flame
export const ChallengesIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Outer flame */}
      <motion.path
        d="M24 4 C24 4 32 14 32 24 C32 32 28 40 24 40 C20 40 16 32 16 24 C16 14 24 4 24 4 Z"
        fill="hsl(var(--accent) / 0.4)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 40px' }}
      />
      {/* Inner flame */}
      <motion.path
        d="M24 16 C24 16 28 22 28 28 C28 34 26 38 24 38 C22 38 20 34 20 28 C20 22 24 16 24 16 Z"
        fill="hsl(var(--primary))"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 38px' }}
      />
      {/* Flicker effect */}
      {!prefersReducedMotion && (
        <motion.path
          d="M24 4 C24 4 32 14 32 24 C32 32 28 40 24 40 C20 40 16 32 16 24 C16 14 24 4 24 4 Z"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.03, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '24px 24px' }}
        />
      )}
    </svg>
  );
};

// Tax icon - Document with calculation
export const TaxIcon = ({ className = '' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`w-10 h-10 ${className}`}
      fill="none"
    >
      {/* Document */}
      <motion.rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="3"
        fill="hsl(var(--muted) / 0.2)"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        initial={prefersReducedMotion ? {} : { scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '24px 42px' }}
      />
      {/* Lines */}
      {[[16, 14, 32, 14], [16, 20, 28, 20], [16, 26, 30, 26]].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={prefersReducedMotion ? {} : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {/* Checkmark */}
      <motion.path
        d="M18 34 L22 38 L30 30"
        stroke="hsl(var(--accent))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={prefersReducedMotion ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};
