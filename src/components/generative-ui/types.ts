export type ComponentType = 'spending_chart' | 'budget_alert' | 'subscription_list' | 'action_card';

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
