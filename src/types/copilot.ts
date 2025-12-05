// =========================================
// Financial Co-Pilot Type Definitions
// =========================================

/**
 * Tracks what the user is currently doing and seeing.
 * The Co-Pilot uses this to change its personality and suggestions.
 */
export interface CoPilotContextState {
  currentRoute: string;
  pageTitle: string;
  activeElementId?: string;
  selectedDataId?: string;
  userMood?: 'saving_mode' | 'spending_mode' | 'neutral';
  sessionDuration: number;
  lastInteractionTime: number;
}

/**
 * Defines action categories the Co-Pilot can execute
 */
export type ActionCategory = 'NAVIGATION' | 'THEME' | 'DATA' | 'UI_CONTROL' | 'MODAL';

/**
 * Defines actions the Co-Pilot can execute on behalf of the user.
 */
export interface CoPilotAction {
  id: string;
  category: ActionCategory;
  description: string;
  keywords: string[];
  execute: (params?: Record<string, unknown>) => Promise<void> | void;
  relatedElementId?: string;
}

/**
 * Pulse notification states for proactive help
 */
export type PulseState = 'idle' | 'anomaly' | 'opportunity' | 'urgent' | 'help';

export interface PulseNotification {
  state: PulseState;
  message: string;
  actionId?: string;
  expiresAt?: number;
}

/**
 * Registry of allowed React components the Agent can render inline.
 */
export type GenUIWidgetType = 
  | 'mini_chart'
  | 'stock_ticker'
  | 'budget_dial'
  | 'comparison_table'
  | 'quick_transfer'
  | 'action_card'
  | 'spending_chart'
  | 'budget_alert'
  | 'subscription_list'
  | 'interactive_goal_builder'
  | 'cash_flow_sankey'
  | 'net_worth_timeline'
  | 'financial_health_score'
  | 'ai_insights_carousel'
  | 'predictive_forecast'
  | 'emotion_aware_response';

export interface GenUIWidget {
  type: GenUIWidgetType;
  props: Record<string, unknown>;
  title?: string;
}

/**
 * Quick action chips for user responses
 */
export interface QuickAction {
  label: string;
  actionId: string;
  params?: Record<string, unknown>;
}

/**
 * Co-Pilot message structure with GenUI support
 */
export interface CoPilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  content: string;
  widget?: GenUIWidget;
  quickActions?: QuickAction[];
  isStreaming?: boolean;
}

/**
 * Contextual greeting based on route and state
 */
export interface ContextualGreeting {
  text: string;
  suggestions: string[];
}

/**
 * Element registry for visual tour guide
 */
export interface ElementInfo {
  id: string;
  label: string;
  description: string;
  route: string;
}

/**
 * Route context configuration
 */
export interface RouteContext {
  route: string;
  title: string;
  greeting: string;
  suggestions: string[];
  relevantActions: string[];
}
