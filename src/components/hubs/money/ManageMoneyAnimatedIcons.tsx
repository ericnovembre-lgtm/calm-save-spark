import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

const iconVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.95 }
};

/**
 * BudgetIcon - Pie chart that re-slices itself
 */
export function BudgetIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="4"
        opacity="0.3"
      />
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeDasharray="113.1"
        strokeDashoffset="28.3"
        strokeLinecap="round"
        initial={{ rotate: -90, strokeDashoffset: 113.1 }}
        animate={{ rotate: -90, strokeDashoffset: 28.3 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ transformOrigin: '24px 24px' }}
      />
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="4"
        strokeDasharray="113.1"
        strokeDashoffset="84.8"
        strokeLinecap="round"
        initial={{ rotate: 170, strokeDashoffset: 113.1 }}
        animate={{ rotate: 170, strokeDashoffset: 84.8 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        style={{ transformOrigin: '24px 24px' }}
      />
    </motion.svg>
  );
}

/**
 * TransactionsIcon - Two arrows flowing in opposite directions
 */
export function TransactionsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.path
        d="M8 18h24l-6-6"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M40 30H16l6 6"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </motion.svg>
  );
}

/**
 * SubscriptionsIcon - Circular arrow that loops smoothly
 */
export function SubscriptionsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <motion.path
        d="M24 8A16 16 0 1 1 8 24"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d="M8 14v10h10"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/**
 * DebtsIcon - Shield with sweeping light reflection
 */
export function DebtsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <clipPath id="shieldClip">
          <path d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z" />
        </clipPath>
      </defs>
      <path
        d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z"
        fill="none"
        stroke="url(#shieldGradient)"
        strokeWidth="2.5"
      />
      <motion.rect
        x="-20"
        y="0"
        width="20"
        height="48"
        fill="white"
        opacity="0.2"
        clipPath="url(#shieldClip)"
        animate={{ x: [-20, 60] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: [0.22, 1, 0.36, 1] }}
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        $
      </text>
    </motion.svg>
  );
}

/**
 * PotsIcon - Coins dropping and stacking
 */
export function PotsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Stacked coins */}
      <motion.ellipse
        cx="24"
        cy="36"
        rx="14"
        ry="4"
        fill="hsl(var(--muted))"
        opacity="0.5"
      />
      <motion.ellipse
        cx="24"
        cy="32"
        rx="14"
        ry="4"
        fill="hsl(var(--accent))"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.ellipse
        cx="24"
        cy="28"
        rx="14"
        ry="4"
        fill="hsl(var(--primary))"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="4"
        fill="hsl(var(--primary))"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Falling coin */}
      <motion.ellipse
        cx="24"
        cy="8"
        rx="10"
        ry="3"
        fill="hsl(var(--accent))"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 12, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.svg>
  );
}

/**
 * AutomationsIcon - Gears turning with lightning bolt
 */
export function AutomationsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Large gear */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: '20px 28px' }}
      >
        <circle cx="20" cy="28" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="18"
            y="16"
            width="4"
            height="6"
            fill="hsl(var(--primary))"
            transform={`rotate(${angle} 20 28)`}
          />
        ))}
      </motion.g>
      {/* Small gear */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: '34px 18px' }}
      >
        <circle cx="34" cy="18" r="5" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <rect
            key={i}
            x="32.5"
            y="10"
            width="3"
            height="4"
            fill="hsl(var(--accent))"
            transform={`rotate(${angle} 34 18)`}
          />
        ))}
      </motion.g>
      {/* Lightning bolt pulse */}
      <motion.path
        d="M38 26l-4 6h3l-2 6 5-7h-3l3-5z"
        fill="hsl(var(--accent))"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.svg>
  );
}

/**
 * BillNegotiationIcon - Speech bubble with shrinking dollar
 */
export function BillNegotiationIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <path
        d="M8 10h32a2 2 0 012 2v20a2 2 0 01-2 2H18l-8 8v-8H8a2 2 0 01-2-2V12a2 2 0 012-2z"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
      />
      <motion.text
        x="24"
        y="26"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="hsl(var(--accent))"
        animate={{ scale: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '24px 22px' }}
      >
        $
      </motion.text>
    </motion.svg>
  );
}

/**
 * AccountsIcon - Wallet opening/closing
 */
export function AccountsIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <rect
        x="6"
        y="14"
        width="36"
        height="24"
        rx="3"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
      />
      <motion.path
        d="M6 20h36"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <motion.circle
        cx="36"
        cy="28"
        r="3"
        fill="hsl(var(--accent))"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
      />
    </motion.svg>
  );
}

/**
 * FinancialPulseIcon - Heart rate line animating
 */
export function FinancialPulseIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.path
        d="M4 24h8l3-10 4 20 4-14 3 4h18"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="44"
        cy="24"
        r="2"
        fill="hsl(var(--accent))"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.svg>
  );
}

/**
 * ExpenseSplitIcon - People with dividing line
 */
export function ExpenseSplitIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Person 1 */}
      <motion.g initial={{ x: -5 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
        <circle cx="14" cy="16" r="5" fill="hsl(var(--primary))" />
        <path d="M6 36c0-6 4-10 8-10s8 4 8 10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
      </motion.g>
      {/* Person 2 */}
      <motion.g initial={{ x: 5 }} animate={{ x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <circle cx="34" cy="16" r="5" fill="hsl(var(--accent))" />
        <path d="M26 36c0-6 4-10 8-10s8 4 8 10" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
      </motion.g>
      {/* Dividing line */}
      <motion.path
        d="M24 8v32"
        stroke="hsl(var(--muted))"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
    </motion.svg>
  );
}

/**
 * SmartCategoriesIcon - Tags shuffling/sorting
 */
export function SmartCategoriesIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.rect
        x="6"
        y="8"
        width="24"
        height="10"
        rx="2"
        fill="hsl(var(--primary))"
        opacity="0.8"
        initial={{ x: 10 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.rect
        x="10"
        y="20"
        width="28"
        height="10"
        rx="2"
        fill="hsl(var(--accent))"
        opacity="0.8"
        initial={{ x: -10 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.rect
        x="14"
        y="32"
        width="20"
        height="10"
        rx="2"
        fill="hsl(var(--muted))"
        initial={{ x: 5 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
    </motion.svg>
  );
}

/**
 * FinancialCalendarIcon - Calendar with date flipping
 */
export function FinancialCalendarIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <rect
        x="6"
        y="10"
        width="36"
        height="32"
        rx="3"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
      />
      <path d="M6 18h36" stroke="hsl(var(--primary))" strokeWidth="2" />
      <path d="M14 6v8M34 6v8" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
      <motion.text
        x="24"
        y="34"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="hsl(var(--accent))"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        15
      </motion.text>
    </motion.svg>
  );
}

/**
 * ImportExportIcon - Arrows exchanging up/down
 */
export function ImportExportIcon({ className, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-primary overflow-visible", className)}
      variants={iconVariants}
      whileHover="hover"
      whileTap="tap"
      aria-hidden="true"
    >
      {/* Up arrow */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <path
          d="M16 36V12"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 18l6-6 6 6"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      {/* Down arrow */}
      <motion.g
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.3 }}
      >
        <path
          d="M32 12v24"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M26 30l6 6 6-6"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

// Icon mapping for easy lookup
export const AnimatedIconMap = {
  Budget: BudgetIcon,
  Transactions: TransactionsIcon,
  Subscriptions: SubscriptionsIcon,
  Debts: DebtsIcon,
  Pots: PotsIcon,
  Automations: AutomationsIcon,
  'Bill Negotiation': BillNegotiationIcon,
  Accounts: AccountsIcon,
  'Financial Pulse': FinancialPulseIcon,
  'Expense Split': ExpenseSplitIcon,
  'Smart Categories': SmartCategoriesIcon,
  'Financial Calendar': FinancialCalendarIcon,
  'Import/Export': ImportExportIcon,
} as const;

export type AnimatedIconName = keyof typeof AnimatedIconMap;

export default AnimatedIconMap;
