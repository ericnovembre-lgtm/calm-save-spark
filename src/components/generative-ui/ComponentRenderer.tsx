import { SpendingChart } from './SpendingChart';
import { BudgetAlertCard } from './BudgetAlertCard';
import { SubscriptionList } from './SubscriptionList';
import { ActionCard } from './ActionCard';
import { ComponentMessage } from './types';
import { useNavigate } from 'react-router-dom';

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
