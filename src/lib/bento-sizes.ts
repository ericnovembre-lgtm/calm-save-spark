/**
 * Bento Grid Size Utilities
 * Maps widget types to their optimal Bento grid sizes
 */

export type BentoSize = '1x1' | '2x1' | '1x2' | '2x2' | 'full';

export const bentoSizeClasses: Record<BentoSize, string> = {
  '1x1': 'bento-1x1',
  '2x1': 'bento-2x1',
  '1x2': 'bento-1x2',
  '2x2': 'bento-2x2',
  'full': 'bento-full',
};

/**
 * Default widget size mapping based on content type and importance
 * Claude can override these in the layout specification
 */
export const defaultWidgetSizes: Record<string, BentoSize> = {
  // Hero widgets - largest
  balance_hero: '2x2',
  net_worth: '2x2',
  
  // Wide widgets - good for lists and charts
  goal_progress: '2x1',
  goals: '2x1',
  ai_insight: '2x1',
  insights: '2x1',
  daily_briefing: '2x1',
  briefing: '2x1',
  cashflow_forecast: '2x1',
  cashflow: '2x1',
  
  // Tall widgets - good for vertical content
  spending_breakdown: '1x2',
  budget_status: '1x2',
  budgets: '1x2',
  upcoming_bills: '1x2',
  bills: '1x2',
  debt_tracker: '1x2',
  debts: '1x2',
  
  // Compact widgets - standard 1x1
  credit_score: '1x1',
  credit: '1x1',
  investment_summary: '1x1',
  portfolio: '1x1',
  social_sentiment: '1x1',
  sentiment: '1x1',
  ai_usage: '1x1',
  tax_documents: '1x1',
  nudges: '1x1',
  recommendations: '1x1',
  connect_account: '1x1',
  accounts: '1x1',
  subscriptions: '1x1',
  subscription_manager: '1x1',
  spending_alerts: '1x1',
  budget_alerts: '1x1',
  net_worth_chart: '1x1',
  savings_streak: '1x1',
  milestones: '1x1',
  journey: '1x1',
  streak_recovery: '1x1',
  streak_warning: '1x1',
};

/**
 * Essential widgets that ALWAYS appear in the dashboard
 * These are forcefully merged into the grid if Claude's layout doesn't include them
 */
export const essentialWidgets = ['ai_insight', 'cashflow_forecast'] as const;

/**
 * Check if a widget is essential (must always be shown)
 */
export function isEssentialWidget(widgetId: string): boolean {
  return essentialWidgets.includes(widgetId as typeof essentialWidgets[number]);
}

/**
 * Get the Bento size class for a widget
 */
export function getBentoSizeClass(widgetId: string, overrideSize?: BentoSize): string {
  const size = overrideSize || defaultWidgetSizes[widgetId] || '1x1';
  return bentoSizeClasses[size];
}

/**
 * Get the Bento size for a widget
 */
export function getBentoSize(widgetId: string): BentoSize {
  return defaultWidgetSizes[widgetId] || '1x1';
}

/**
 * Aurora gradient class based on financial sentiment
 */
export function getAuroraClass(changePercent: number): string {
  if (changePercent > 5) return 'aurora-emerald';
  if (changePercent > 0) return 'aurora-cyan';
  if (changePercent > -5) return 'aurora-amber';
  return 'aurora-rose';
}

/**
 * Get sentiment colors for aurora effects
 */
export function getSentimentColors(changePercent: number) {
  if (changePercent > 5) {
    return {
      primary: 'hsl(160, 84%, 39%)', // emerald
      secondary: 'hsl(142, 71%, 45%)', // green
      glow: 'hsla(160, 84%, 39%, 0.3)',
    };
  }
  if (changePercent > 0) {
    return {
      primary: 'hsl(189, 94%, 43%)', // cyan
      secondary: 'hsl(217, 91%, 60%)', // blue
      glow: 'hsla(189, 94%, 43%, 0.3)',
    };
  }
  if (changePercent > -5) {
    return {
      primary: 'hsl(38, 92%, 50%)', // amber
      secondary: 'hsl(25, 95%, 53%)', // orange
      glow: 'hsla(38, 92%, 50%, 0.3)',
    };
  }
  return {
    primary: 'hsl(350, 89%, 60%)', // rose
    secondary: 'hsl(0, 84%, 60%)', // red
    glow: 'hsla(350, 89%, 60%, 0.3)',
  };
}
