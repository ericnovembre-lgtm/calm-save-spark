export type ComponentType = 
  | 'spending_chart' 
  | 'budget_alert' 
  | 'subscription_list' 
  | 'action_card'
  | 'interactive_goal_builder'
  | 'cash_flow_sankey'
  | 'net_worth_timeline'
  | 'financial_health_score'
  | 'ai_insights_carousel'
  | 'predictive_forecast'
  | 'emotion_aware_response'
  // CoPilot GenUI 2.0 widgets
  | 'mini_chart'
  | 'stock_ticker'
  | 'budget_dial'
  | 'comparison_table'
  | 'quick_transfer';

export interface ComponentMessage {
  type: ComponentType;
  props: Record<string, any>;
  fallbackText?: string;
}

export interface SpendingDataPoint {
  date: string;
  amount: number;
  category?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  nextBilling: string;
  category?: string;
}
