import { SpendingChart } from './SpendingChart';
import { BudgetAlertCard } from './BudgetAlertCard';
import { SubscriptionList } from './SubscriptionList';
import { ActionCard } from './ActionCard';
import { InteractiveGoalBuilder } from './InteractiveGoalBuilder';
import { CashFlowSankey } from './CashFlowSankey';
import { NetWorthTimeline } from './NetWorthTimeline';
import { FinancialHealthScore } from './FinancialHealthScore';
import { AIInsightsCarousel } from './AIInsightsCarousel';
import { PredictiveSpendingForecast } from './PredictiveSpendingForecast';
import { EmotionAwareResponse } from './EmotionAwareResponse';
import { ComponentMessage } from './types';
import { useNavigate } from 'react-router-dom';

// CoPilot GenUI widgets
import { 
  MiniChart, 
  StockTicker, 
  BudgetDial, 
  ComparisonTable, 
  QuickTransfer 
} from '@/components/copilot/genui';

interface ComponentRendererProps {
  componentData: ComponentMessage;
  onAction?: (actionType: string, data: any) => Promise<void>;
}

export function ComponentRenderer({ componentData, onAction }: ComponentRendererProps) {
  const navigate = useNavigate();
  const { type, props, fallbackText } = componentData;

  try {
    switch (type) {
      case 'spending_chart':
        return <SpendingChart data={props.data} color={props.color} title={props.title} />;
      
      case 'budget_alert':
        return (
          <BudgetAlertCard 
            category={props.category}
            limit={props.limit}
            current={props.current}
            warningMessage={props.warningMessage}
            onViewDetails={() => navigate('/budget')}
          />
        );
      
      case 'subscription_list':
        return (
          <SubscriptionList 
            subscriptions={props.subscriptions}
            onCancel={async (id: string) => {
              if (onAction) {
                await onAction('cancel_subscription', { id });
              }
            }}
            onViewAll={() => navigate('/subscriptions')}
          />
        );
      
      case 'action_card':
        return (
          <ActionCard 
            title={props.title}
            description={props.description}
            actionLabel={props.actionLabel}
            actionType={props.actionType}
            actionData={props.actionData}
            icon={props.icon}
            variant={props.variant}
            onAction={async (data: any) => {
              if (onAction) {
                await onAction(props.actionType, data);
              }
            }}
          />
        );
      
      case 'interactive_goal_builder':
        return (
          <InteractiveGoalBuilder
            suggestedAmount={props.suggestedAmount}
            suggestedDate={props.suggestedDate}
            goalType={props.goalType}
            onCreateGoal={async (data: any) => {
              if (onAction) {
                await onAction('create_goal', data);
              }
            }}
          />
        );
      
      case 'cash_flow_sankey':
        return (
          <CashFlowSankey
            income={props.income}
            expenses={props.expenses}
            savings={props.savings}
            title={props.title}
          />
        );
      
      case 'net_worth_timeline':
        return (
          <NetWorthTimeline
            historicalData={props.historicalData}
            projectedData={props.projectedData}
            title={props.title}
            currentNetWorth={props.currentNetWorth}
          />
        );
      
      case 'financial_health_score':
        return (
          <FinancialHealthScore
            overallScore={props.overallScore}
            categories={props.categories}
            onViewDetails={() => navigate('/financial-health')}
            onImprove={async (category: string) => {
              if (onAction) {
                await onAction('improve_category', { category });
              }
            }}
          />
        );
      
      case 'ai_insights_carousel':
        return (
          <AIInsightsCarousel
            insights={props.insights.map((insight: any) => ({
              ...insight,
              action: insight.action ? {
                ...insight.action,
                onClick: async () => {
                  if (onAction) {
                    await onAction('insight_action', { insightId: insight.id });
                  }
                }
              } : undefined
            }))}
            title={props.title}
          />
        );
      
      case 'predictive_forecast':
        return (
          <PredictiveSpendingForecast
            category={props.category}
            historicalData={props.historicalData}
            predictions={props.predictions}
            insights={props.insights}
          />
        );
      
      case 'emotion_aware_response':
        return (
          <EmotionAwareResponse
            detectedEmotion={props.detectedEmotion}
            confidence={props.confidence}
            response={props.response}
            supportResources={props.supportResources}
          />
        );
      
      // ===== CoPilot GenUI 2.0 Widgets =====
      case 'mini_chart':
        return (
          <MiniChart
            data={props.data}
            type={props.type || 'line'}
            color={props.color || 'primary'}
            showTrend={props.showTrend ?? true}
            title={props.title}
            height={props.height || 60}
          />
        );
      
      case 'stock_ticker':
        return (
          <StockTicker
            symbol={props.symbol}
            name={props.name}
            price={props.price}
            change={props.change}
            changePercent={props.changePercent}
          />
        );
      
      case 'budget_dial':
        return (
          <BudgetDial
            category={props.category}
            spent={props.spent}
            budget={props.budget}
          />
        );
      
      case 'comparison_table':
        return (
          <ComparisonTable
            title={props.title}
            items={props.items}
            labelA={props.labelA || props.column1Label || 'Period 1'}
            labelB={props.labelB || props.column2Label || 'Period 2'}
          />
        );
      
      case 'quick_transfer':
        return (
          <QuickTransfer
            fromAccounts={props.fromAccounts}
            toAccounts={props.toAccounts}
            onTransfer={async (data: any) => {
              if (onAction) {
                await onAction('transfer', data);
              }
            }}
          />
        );
      
      default:
        return (
          <div className="text-muted-foreground italic text-sm">
            {fallbackText || 'Component not found'}
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering component:', error);
    return (
      <div className="text-destructive text-sm">
        Failed to render component. {fallbackText}
      </div>
    );
  }
}
