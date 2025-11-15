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
export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => !isProduction();

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
export const APP_NAME = '$ave+';
export const APP_TAGLINE = 'Save while you spend';
export const API_BASE_URL = ''; // Empty as per spec
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en-US';

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

export const FEATURE_FLAGS = {
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
  key: string;
  name: string;
  description: string;
}

export const FREEMIUM_FEATURE_ORDER: readonly FreemiumFeature[] = [
  {
    key: 'basic_savings',
    name: 'Basic Savings',
    description: 'Create up to 3 savings goals',
  },
  {
    key: 'smart_pots',
    name: 'Smart Pots',
    description: 'Organize savings into goal-based accounts',
  },
  {
    key: 'automated_savings',
    name: 'Automated Savings',
    description: 'Basic automation with round-ups',
  },
  {
    key: 'unlimited_goals',
    name: 'Unlimited Goals',
    description: 'Create unlimited savings goals',
  },
  {
    key: 'advanced_automation',
    name: 'Advanced Automation',
    description: 'Smart rules and scheduled transfers',
  },
  {
    key: 'financial_insights',
    name: 'Financial Insights',
    description: 'AI-powered analytics and recommendations',
  },
  {
    key: 'premium_support',
    name: 'Premium Support',
    description: '24/7 priority customer support',
  },
  {
    key: 'saveplus_card',
    name: '$ave+ Card',
    description: 'Premium debit card with cashback',
  },
  {
    key: 'debt_management',
    name: 'Debt Management',
    description: 'Track and optimize debt payoff strategies',
  },
  {
    key: 'investment_tracking',
    name: 'Investment Tracking',
    description: 'Monitor portfolio performance and gains',
  },
  {
    key: 'credit_monitoring',
    name: 'Credit Monitoring',
    description: 'Track credit score and improvement tips',
  },
  {
    key: 'subscription_insights',
    name: 'Subscription Insights',
    description: 'Detect and manage recurring payments',
  },
  {
    key: 'budget_templates',
    name: 'Budget Templates',
    description: 'Pre-built budgets for different income levels',
  },
  {
    key: 'cashflow_forecast',
    name: 'Cashflow Forecasting',
    description: 'AI-powered predictions of future finances',
  },
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights with custom reports',
  },
  {
    key: 'custom_automation',
    name: 'Custom Automation Rules',
    description: 'Build complex multi-step automations',
  },
  {
    key: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to your data',
  },
  {
    key: 'white_label',
    name: 'White Label',
    description: 'Custom branding and enterprise features',
  },
  {
    key: 'dedicated_support',
    name: 'Dedicated Account Manager',
    description: 'Personal financial advisor and priority support',
  },
  {
    key: 'enterprise_features',
    name: 'Enterprise Features',
    description: 'Team management, SSO, and advanced security',
  },
] as const;

/**
 * Free Features Configuration
 * Defines which features are included in the free tier (indices from FREEMIUM_FEATURE_ORDER)
 */
export const FREE_FEATURE_INDICES = [0, 1, 2] as const; // Basic Savings, Smart Pots, Automated Savings

// =============================================================================
// LIMITS & QUOTAS
// =============================================================================

export const LIMITS = {
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

export const ONBOARDING_STEPS = [
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

export const SAVINGS_TIERS = [
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

export const BREAKPOINTS = {
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

export const ANIMATION_DURATION = {
  INSTANT: 100,
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 1000,
} as const;

// =============================================================================
// TOAST DURATIONS
// =============================================================================

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
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

export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// =============================================================================
// PERFORMANCE BUDGETS
// =============================================================================

export const PERFORMANCE_BUDGETS = {
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
// TYPE EXPORTS (inferred from constants)
// =============================================================================

export type FeatureFlags = typeof FEATURE_FLAGS;
export type EnvConfig = typeof ENV_CONFIG;
export type Breakpoints = typeof BREAKPOINTS;
export type AnimationDurations = typeof ANIMATION_DURATION;
export type ToastDurations = typeof TOAST_DURATION;
export type ApiEndpoints = typeof API_ENDPOINTS;
export type Limits = typeof LIMITS;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export type SavingsTiers = typeof SAVINGS_TIERS;
export type PerformanceBudgets = typeof PERFORMANCE_BUDGETS;
export type SecurityHeaders = typeof SECURITY_HEADERS;

// =============================================================================
// DEFAULT EXPORT (Aggregated Constants)
// =============================================================================

export default {
  FEATURE_FLAGS,
  APP_NAME,
  APP_TAGLINE,
  API_BASE_URL,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  BREAKPOINTS,
  ANIMATION_DURATION,
  TOAST_DURATION,
  FREEMIUM_FEATURE_ORDER,
  API_ENDPOINTS,
  LIMITS,
  TOKEN_COLORS,
  COLORS,
  ONBOARDING_STEPS,
  SAVINGS_TIERS,
  PERFORMANCE_BUDGETS,
  SECURITY_HEADERS,
  STORAGE_KEYS,
  ENV_CONFIG,
  isProduction,
  isDevelopment,
} as const;
