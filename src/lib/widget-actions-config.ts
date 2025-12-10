import { 
  ArrowRightLeft, 
  Receipt, 
  Plus, 
  Target, 
  PiggyBank, 
  BarChart2,
  TrendingUp,
  Briefcase,
  Sparkles,
  History,
  DollarSign,
  Calendar,
  CreditCard,
  Settings,
  Eye,
  Wallet,
  LineChart,
  type LucideIcon
} from 'lucide-react';

export interface WidgetAction {
  id: string;
  label: string;
  icon: LucideIcon;
  route?: string;
  modal?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export const WIDGET_ACTIONS: Record<string, WidgetAction[]> = {
  // Balance widget
  balance_hero: [
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, route: '/transfer' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, route: '/transactions' },
  ],
  net_worth: [
    { id: 'view_history', label: 'History', icon: LineChart, route: '/net-worth' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, route: '/accounts' },
  ],
  
  // Goals widget
  goal_progress: [
    { id: 'add_funds', label: 'Add Funds', icon: Plus, modal: 'add-to-goal', variant: 'primary' },
    { id: 'view_goals', label: 'View All', icon: Target, route: '/goals' },
  ],
  goals: [
    { id: 'add_funds', label: 'Add Funds', icon: Plus, modal: 'add-to-goal', variant: 'primary' },
    { id: 'view_goals', label: 'View All', icon: Target, route: '/goals' },
  ],
  
  // Budget widgets
  spending_breakdown: [
    { id: 'set_budget', label: 'Set Budget', icon: PiggyBank, route: '/budgets/new' },
    { id: 'view_details', label: 'Details', icon: BarChart2, route: '/budgets' },
  ],
  budget_status: [
    { id: 'set_budget', label: 'Set Budget', icon: PiggyBank, route: '/budgets/new' },
    { id: 'view_details', label: 'Details', icon: BarChart2, route: '/budgets' },
  ],
  budgets: [
    { id: 'set_budget', label: 'Set Budget', icon: PiggyBank, route: '/budgets/new' },
    { id: 'view_details', label: 'Details', icon: BarChart2, route: '/budgets' },
  ],
  
  // Portfolio/Investments
  investment_summary: [
    { id: 'invest', label: 'Invest', icon: TrendingUp, route: '/investments', variant: 'primary' },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, route: '/investments' },
  ],
  portfolio: [
    { id: 'invest', label: 'Invest', icon: TrendingUp, route: '/investments', variant: 'primary' },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, route: '/investments' },
  ],
  
  // Credit Score
  credit_score: [
    { id: 'improve', label: 'Improve', icon: Sparkles, modal: 'credit-tips' },
    { id: 'history', label: 'History', icon: History, route: '/credit-score' },
  ],
  credit: [
    { id: 'improve', label: 'Improve', icon: Sparkles, modal: 'credit-tips' },
    { id: 'history', label: 'History', icon: History, route: '/credit-score' },
  ],
  
  // Bills
  upcoming_bills: [
    { id: 'pay_now', label: 'Pay', icon: DollarSign, modal: 'pay-bill', variant: 'primary' },
    { id: 'view_bills', label: 'All Bills', icon: Calendar, route: '/bills' },
  ],
  bills: [
    { id: 'pay_now', label: 'Pay', icon: DollarSign, modal: 'pay-bill', variant: 'primary' },
    { id: 'view_bills', label: 'All Bills', icon: Calendar, route: '/bills' },
  ],
  
  // Debt
  debt_tracker: [
    { id: 'make_payment', label: 'Pay', icon: DollarSign, modal: 'debt-payment', variant: 'primary' },
    { id: 'view_debts', label: 'View All', icon: CreditCard, route: '/debts' },
  ],
  debts: [
    { id: 'make_payment', label: 'Pay', icon: DollarSign, modal: 'debt-payment', variant: 'primary' },
    { id: 'view_debts', label: 'View All', icon: CreditCard, route: '/debts' },
  ],
  
  // Subscriptions
  subscriptions: [
    { id: 'manage', label: 'Manage', icon: Settings, route: '/subscriptions' },
    { id: 'view', label: 'View All', icon: Eye, route: '/subscriptions' },
  ],
  subscription_manager: [
    { id: 'manage', label: 'Manage', icon: Settings, route: '/subscriptions' },
    { id: 'view', label: 'View All', icon: Eye, route: '/subscriptions' },
  ],
  
  // Net Worth Chart
  net_worth_chart: [
    { id: 'view_history', label: 'History', icon: LineChart, route: '/net-worth' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, route: '/accounts' },
  ],
  
  // Net Worth Dashboard
  net_worth_dashboard: [
    { id: 'view_history', label: 'History', icon: LineChart, route: '/net-worth' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, route: '/accounts' },
  ],
  
  // Income
  income: [
    { id: 'add_income', label: 'Add', icon: Plus, route: '/income', variant: 'primary' },
    { id: 'view_income', label: 'View All', icon: DollarSign, route: '/income' },
  ],
  income_summary: [
    { id: 'add_income', label: 'Add', icon: Plus, route: '/income', variant: 'primary' },
    { id: 'view_analytics', label: 'Analytics', icon: BarChart2, route: '/income' },
  ],
  
  // AI Insights
  ai_insight: [
    { id: 'view_insights', label: 'View All', icon: Sparkles, route: '/insights' },
  ],
  insights: [
    { id: 'view_insights', label: 'View All', icon: Sparkles, route: '/insights' },
  ],
  
  // Cash Flow
  cashflow_forecast: [
    { id: 'view_forecast', label: 'Full Forecast', icon: LineChart, route: '/cashflow' },
  ],
  cashflow: [
    { id: 'view_forecast', label: 'Full Forecast', icon: LineChart, route: '/cashflow' },
  ],
  
  // Spending Alerts
  spending_alerts: [
    { id: 'view_budgets', label: 'Budgets', icon: PiggyBank, route: '/budgets' },
  ],
  budget_alerts: [
    { id: 'view_budgets', label: 'Budgets', icon: PiggyBank, route: '/budgets' },
  ],
};

export function getWidgetActions(widgetId: string): WidgetAction[] {
  return WIDGET_ACTIONS[widgetId] || [];
}
