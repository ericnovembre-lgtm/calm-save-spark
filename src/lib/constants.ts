/**
 * $ave+ Constants Module
 * TypeScript constants with neutral palette (Off-white, Black, Light Beige)
 * SSR-safe environment helpers
 */

// =============================================================================
// ENVIRONMENT & CONFIG
// =============================================================================

/**
 * SSR-safe environment helpers
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Environment configuration with getters for SSR safety
 */
export const ENV_CONFIG = {
  get IS_PRODUCTION() { return isProduction(); },
  get IS_DEVELOPMENT() { return isDevelopment(); },
} as const;

/**
 * Application configuration
 */
export const APP_CONFIG = {
  NAME: '$ave+',
  VERSION: '1.0.0',
  API_BASE_URL: '', // Empty as per spec
} as const;

// =============================================================================
// COLORS & DESIGN TOKENS
// =============================================================================

/**
 * Neutral palette design tokens
 * Maps to CSS variables defined in index.css
 */
export const TOKEN_COLORS = {
  BG: 'var(--color-bg)',          // #F8F6F0 off-white (light) / #000000 black (dark)
  TEXT: 'var(--color-text)',      // #000000 black (light) / #F8F6F0 off-white (dark)
  ACCENT: 'var(--color-accent)',  // #E9DFCE light beige (light) / #BBAE96 (dark)
  BORDER: 'var(--color-border, #E6E0D5)',
  MUTED: 'var(--color-muted, #6F6F6F)',
} as const;

/**
 * Legacy color mapping for backward compatibility
 * All map to neutral palette (no blues/neons)
 */
export const COLORS = {
  PRIMARY: TOKEN_COLORS.TEXT,     // Black emphasis
  SUCCESS: TOKEN_COLORS.TEXT,     // Black (neutral)
  WARNING: TOKEN_COLORS.TEXT,     // Black (neutral)
  ERROR: TOKEN_COLORS.TEXT,       // Black (neutral)
  INFO: TOKEN_COLORS.TEXT,        // Black (neutral)
  BACKGROUND: TOKEN_COLORS.BG,
  FOREGROUND: TOKEN_COLORS.TEXT,
  ACCENT: TOKEN_COLORS.ACCENT,
  BORDER: TOKEN_COLORS.BORDER,
  MUTED: TOKEN_COLORS.MUTED,
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export interface FeatureFlags {
  readonly ENABLE_ANALYTICS: boolean;
  readonly ENABLE_COACH: boolean;
  readonly ENABLE_ANIMATIONS: boolean;
  readonly ENABLE_ADVANCED_SEARCH: boolean;
  readonly ENABLE_REWARDS: boolean;
  readonly ENABLE_CARD: boolean;
  readonly ENABLE_INSIGHTS: boolean;
  readonly ENABLE_AUTOMATIONS: boolean;
  readonly ENABLE_ADMIN_TOOLS: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  ENABLE_ANALYTICS: true,
  ENABLE_COACH: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_REWARDS: true,
  ENABLE_CARD: true,
  ENABLE_INSIGHTS: true,
  ENABLE_AUTOMATIONS: true,
  ENABLE_ADMIN_TOOLS: false, // Disabled by default
} as const;

// =============================================================================
// FREEMIUM FEATURES
// =============================================================================

export interface FreemiumFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly requiresPro: boolean;
}

export const FREEMIUM_FEATURE_ORDER: readonly FreemiumFeature[] = [
  {
    id: 'basic_savings',
    name: 'Basic Savings',
    description: 'Create up to 3 savings goals',
    icon: '💰',
    requiresPro: false,
  },
  {
    id: 'smart_pots',
    name: 'Smart Pots',
    description: 'Organize savings into goal-based accounts',
    icon: '🎯',
    requiresPro: false,
  },
  {
    id: 'automated_savings',
    name: 'Automated Savings',
    description: 'Basic automation with round-ups',
    icon: '⚡',
    requiresPro: false,
  },
  {
    id: 'unlimited_goals',
    name: 'Unlimited Goals',
    description: 'Create unlimited savings goals',
    icon: '🚀',
    requiresPro: true,
  },
  {
    id: 'advanced_automation',
    name: 'Advanced Automation',
    description: 'Smart rules and scheduled transfers',
    icon: '🤖',
    requiresPro: true,
  },
  {
    id: 'financial_insights',
    name: 'Financial Insights',
    description: 'AI-powered analytics and recommendations',
    icon: '📊',
    requiresPro: true,
  },
  {
    id: 'premium_support',
    name: 'Premium Support',
    description: '24/7 priority customer support',
    icon: '💬',
    requiresPro: true,
  },
  {
    id: 'saveplus_card',
    name: '$ave+ Card',
    description: 'Premium debit card with cashback',
    icon: '💳',
    requiresPro: true,
  },
] as const;

// =============================================================================
// LIMITS & QUOTAS
// =============================================================================

export interface Limits {
  readonly FREE_GOALS_LIMIT: number;
  readonly PRO_GOALS_LIMIT: number;
  readonly FREE_POTS_LIMIT: number;
  readonly PRO_POTS_LIMIT: number;
  readonly MAX_GOAL_NAME_LENGTH: number;
  readonly MAX_POT_NAME_LENGTH: number;
  readonly MIN_GOAL_AMOUNT: number;
  readonly MAX_GOAL_AMOUNT: number;
  readonly MAX_AUTOMATION_RULES: number;
  readonly MAX_FILE_UPLOAD_SIZE: number; // bytes
  readonly SESSION_TIMEOUT: number; // milliseconds
  readonly API_RATE_LIMIT: number; // requests per minute
}

export const LIMITS: Limits = {
  FREE_GOALS_LIMIT: 3,
  PRO_GOALS_LIMIT: 999,
  FREE_POTS_LIMIT: 5,
  PRO_POTS_LIMIT: 999,
  MAX_GOAL_NAME_LENGTH: 50,
  MAX_POT_NAME_LENGTH: 50,
  MIN_GOAL_AMOUNT: 1,
  MAX_GOAL_AMOUNT: 1_000_000,
  MAX_AUTOMATION_RULES: 10,
  MAX_FILE_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  API_RATE_LIMIT: 60, // 60 requests per minute
} as const;

// =============================================================================
// ONBOARDING
// =============================================================================

export interface OnboardingStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to $ave+',
    description: 'Let\'s get you started on your savings journey',
    order: 1,
  },
  {
    id: 'create_account',
    title: 'Create Your Account',
    description: 'Set up your secure profile',
    order: 2,
  },
  {
    id: 'first_goal',
    title: 'Set Your First Goal',
    description: 'What are you saving for?',
    order: 3,
  },
  {
    id: 'setup_automation',
    title: 'Enable Auto-Save',
    description: 'Let us help you save automatically',
    order: 4,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start building your financial future',
    order: 5,
  },
] as const;

// =============================================================================
// SAVINGS TIERS
// =============================================================================

export interface SavingsTier {
  readonly name: string;
  readonly minAmount: number;
  readonly maxAmount: number | null;
  readonly apy: number;
  readonly color: string;
}

export const SAVINGS_TIERS: readonly SavingsTier[] = [
  {
    name: 'Starter',
    minAmount: 0,
    maxAmount: 1000,
    apy: 3.5,
    color: TOKEN_COLORS.TEXT,
  },
  {
    name: 'Builder',
    minAmount: 1000,
    maxAmount: 5000,
    apy: 4.0,
    color: TOKEN_COLORS.TEXT,
  },
  {
    name: 'Achiever',
    minAmount: 5000,
    maxAmount: 25000,
    apy: 4.25,
    color: TOKEN_COLORS.TEXT,
  },
  {
    name: 'Elite',
    minAmount: 25000,
    maxAmount: null,
    apy: 4.5,
    color: TOKEN_COLORS.ACCENT,
  },
] as const;

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

export interface Breakpoints {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
}

export const BREAKPOINTS: Breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

export interface AnimationDurations {
  readonly INSTANT: number;
  readonly FAST: number;
  readonly NORMAL: number;
  readonly SLOW: number;
  readonly SLOWER: number;
}

export const ANIMATION_DURATIONS: AnimationDurations = {
  INSTANT: 100,
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 1000,
} as const;

// =============================================================================
// TOAST DURATIONS
// =============================================================================

export interface ToastDurations {
  readonly SUCCESS: number;
  readonly ERROR: number;
  readonly WARNING: number;
  readonly INFO: number;
}

export const TOAST_DURATIONS: ToastDurations = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export interface ApiEndpoints {
  readonly ANALYTICS: string;
  readonly GOALS: string;
  readonly POTS: string;
  readonly AUTOMATIONS: string;
  readonly TRANSACTIONS: string;
  readonly USER: string;
  readonly AUTH: string;
}

export const API_ENDPOINTS: ApiEndpoints = {
  ANALYTICS: '/functions/v1/analytics',
  GOALS: '/rest/v1/goals',
  POTS: '/rest/v1/pots',
  AUTOMATIONS: '/rest/v1/automations',
  TRANSACTIONS: '/rest/v1/transactions',
  USER: '/rest/v1/profiles',
  AUTH: '/auth/v1',
} as const;

// =============================================================================
// SECURITY HEADERS
// =============================================================================

export interface SecurityHeaders {
  readonly 'Content-Security-Policy': string;
  readonly 'X-Frame-Options': string;
  readonly 'X-Content-Type-Options': string;
  readonly 'Referrer-Policy': string;
  readonly 'Permissions-Policy': string;
}

export const SECURITY_HEADERS: SecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// =============================================================================
// PERFORMANCE BUDGETS
// =============================================================================

export interface PerformanceBudgets {
  readonly MAX_BUNDLE_SIZE: number; // bytes
  readonly MAX_IMAGE_SIZE: number; // bytes
  readonly TARGET_FCP: number; // milliseconds
  readonly TARGET_LCP: number; // milliseconds
  readonly TARGET_TTI: number; // milliseconds
}

export const PERFORMANCE_BUDGETS: PerformanceBudgets = {
  MAX_BUNDLE_SIZE: 250 * 1024, // 250KB
  MAX_IMAGE_SIZE: 200 * 1024, // 200KB
  TARGET_FCP: 1800, // 1.8s
  TARGET_LCP: 2500, // 2.5s
  TARGET_TTI: 3800, // 3.8s
} as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  THEME: 'saveplus_theme',
  SESSION: 'analytics_session',
  ONBOARDING_COMPLETE: 'saveplus_onboarding_complete',
  USER_PREFERENCES: 'saveplus_user_prefs',
  ANIMATION_PREFERENCE: 'saveplus_animation_pref',
} as const;

// =============================================================================
// DEFAULT EXPORT (Aggregated Constants)
// =============================================================================

const constants = {
  ENV_CONFIG,
  APP_CONFIG,
  TOKEN_COLORS,
  COLORS,
  FEATURE_FLAGS,
  FREEMIUM_FEATURE_ORDER,
  LIMITS,
  ONBOARDING_STEPS,
  SAVINGS_TIERS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  TOAST_DURATIONS,
  API_ENDPOINTS,
  SECURITY_HEADERS,
  PERFORMANCE_BUDGETS,
  STORAGE_KEYS,
  // Helpers
  isProduction,
  isDevelopment,
} as const;

export default constants;
